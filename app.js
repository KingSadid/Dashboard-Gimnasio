/**
 * 
 * GYM DASHBOARD 
 * Architecture: Service -> Controller -> View
 * 
 */

// --- 1. SERVICE LAYER (API Simulation) ---
const ApiService = {
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    async loginCoach() {
        await this.delay(800);
        return { id: 101, name: "Head Coach Memo", role: "Senior" };
    },

    async fetchAthletes(coachId) {
        await this.delay(1200);
        return [
            { id: 1, user: "Angelly Parra", status: "inactive", points: 45 },
            { id: 2, user: "Andrea Rondón", status: "active", points: 88 },
            { id: 3, user: "Miguelito el mascapito", status: "inactive", points: 12 },
            { id: 4, user: "Sadid Acosta", status: "active", points: 95 },
            { id: 5, user: "Pablo Cháves", status: "inactive", points: 30 }
        ];
    },

    async calculateTeamPerformance(athletes) {
        const total = athletes.reduce((sum, item) => sum + item.points, 0);
        return (total / athletes.length).toFixed(1);
    }
};

// --- 2. UTILS ---
const formatName = (name) => {
    return name.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// --- 3. COMPONENT FACTORY (Stateful Card) ---
const createAthleteCard = (athleteData) => {
    const cardElement = document.createElement('article');
    
    // Internal State (Closure)
    let state = {
        isActive: athleteData.status === 'active',
        isLoading: false
    };

    // Render Function (Updates View based on State)
    const render = () => {
        const { isActive, isLoading } = state;
        const isElite = athleteData.points > 50;

        // Apply visuals
        cardElement.className = `card fade-in ${isActive ? 'active' : ''}`;
        
        cardElement.innerHTML = `
            <div class="card-header">
                <h3>${formatName(athleteData.user)}</h3>
                <div class="meta-tags">
                    <span class="badge ${isElite ? 'elite' : 'amateur'}">
                        ${isElite ? 'Elite' : 'Amateur'}
                    </span>
                    <span class="badge amateur" style="background:transparent; border:1px solid rgba(255,255,255,0.1)">
                        ${athleteData.points} PTS
                    </span>
                </div>
            </div>

            <div class="card-actions">
                <button 
                    class="${isActive ? 'btn-danger' : 'btn-primary'}" 
                    ${isLoading ? 'disabled' : ''}
                >
                    ${isLoading 
                        ? '<span>Procesando...</span>' 
                        : (isActive ? '✖ Desactivar' : '✔ Activar Membresía')
                    }
                </button>
            </div>
        `;

        const btn = cardElement.querySelector('button');
        if (btn) btn.addEventListener('click', handleToggle);
    };

    // Event Handler (Controller logic)
    const handleToggle = async () => {
        // 1. Optimistic UI update (optional) or Loading State
        state.isLoading = true;
        render();

        try {
            // Simulate API Call
            await ApiService.delay(800);
            state.isActive = !state.isActive;
            athleteData.status = state.isActive ? 'active' : 'inactive';
            
        } catch (error) {
            console.error("Toggle failed", error);
            alert("No se pudo actualizar el estado");
        } finally {
            state.isLoading = false;
            render();
        }
    };

    render();
    return cardElement;
};

// --- 4. MAIN CONTROLLER ---
async function initDashboard() {
    // UI 
    const ui = {
        grid: document.getElementById('athletes-grid'),
        loader: document.getElementById('global-loader'),
        statsPanel: document.getElementById('dashboard-stats'),
        coachLabel: document.getElementById('coach-name'),
        scoreLabel: document.getElementById('team-score')
    };

    try {
        // Step 1: Authentication
        const coach = await ApiService.loginCoach();
        ui.coachLabel.textContent = coach.name;

        // Step 2: Data Fetching
        const athletes = await ApiService.fetchAthletes(coach.id);

        // Step 3: Metrics Calculation
        const teamScore = await ApiService.calculateTeamPerformance(athletes);
        ui.scoreLabel.textContent = `${teamScore}`;

        // Step 4: Render UI (using DocumentFragment for performance)
        const fragment = document.createDocumentFragment();
        
        athletes.forEach((athlete, index) => {
            const card = createAthleteCard(athlete);
            card.style.animationDelay = `${index * 100}ms`;
            fragment.appendChild(card);
        });

        // Final DOM Manipulation
        ui.loader.classList.add('hidden'); 
        ui.statsPanel.classList.remove('hidden'); 
        ui.grid.appendChild(fragment); 

    } catch (error) {
        console.error("Critical System Error:", error);
        ui.loader.innerHTML = `
            <div style="color:var(--state-danger); text-align:center">
                <h3>⚠ Error de Conexión</h3>
                <p>No se pudieron cargar los datos del servidor.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);