/**
 * SERVICE LAYER
 * Simula respuestas de Backend. Agrupado para limpieza del namespace.
 */
const Service = {
    authCoach: () => new Promise(resolve => {
        setTimeout(() => resolve({ id: 101, name: "Head Coach Memo" }), 800);
    }),

    getAthletes: (coachId) => new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, user: "Angelly Parra", status: "inactive", points: 45 },
                { id: 2, user: "Sadid Acosta", status: "active", points: 88 },
                { id: 3, user: "Andrés Cubillos", status: "inactive", points: 12 },
                { id: 4, user: "Andrea Rondón", status: "active", points: 95 },
                { id: 5, user: "Pablo Cháves", status: "inactive", points: 30 }
            ]);
        }, 1200);
    }),

    calculateMetrics: (athletes) => new Promise(resolve => {

        const total = athletes.reduce((sum, current) => sum + current.points, 0);
        resolve((total / athletes.length).toFixed(1));
    })
};

/**
 * UTILS
 * Funciones puras de ayuda.
 */
const toTitleCase = (str) => 
    str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * COMPONENT FACTORY
 * Crea una tarjeta con estado encapsulado (Closure Pattern).
 * Esto evita tener variables globales trackeando el estado de cada tarjeta.
 */
const createAthleteCard = (athleteData) => {
    const card = document.createElement('article');
    
    // Estado local
    let currentState = {
        status: athleteData.status,
        isLoading: false
    };

    // Función de renderizado reactivo (View)
    const render = () => {
        const isActive = currentState.status === 'active';
        const isElite = athleteData.points > 50;
        
        card.className = `card fade-in ${isActive ? 'active' : ''}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${toTitleCase(athleteData.user)}</h3>
                <div class="meta-info">
                    <span class="badge ${isElite ? 'elite' : 'amateur'}">
                        ${isElite ? 'Elite' : 'Amateur'}
                    </span>
                    <span>${athleteData.points} PTS</span>
                </div>
            </div>
            
            <button class="${isActive ? 'btn-danger' : 'btn-primary'}" ${currentState.isLoading ? 'disabled' : ''}>
                ${currentState.isLoading ? 'Procesando...' : (isActive ? 'Desactivar Cuenta' : 'Activar Membresía')}
            </button>
        `;
        card.querySelector('button').addEventListener('click', handleToggle);
    };

    // Controller de lógica de negocio 
    const handleToggle = () => {
        currentState.isLoading = true;
        render(); 

        //  Network Request para toggle de estado
        setTimeout(() => {
            currentState.status = currentState.status === 'active' ? 'inactive' : 'active';
            currentState.isLoading = false;
            render();
        }, 800);
    };

    render();
    return card;
};

/**
 * MAIN CONTROLLER
 * Orquestador del flujo de la aplicación.
 */
async function initDashboard() {
    const ui = {
        grid: document.getElementById('athletes-grid'),
        loader: document.getElementById('global-loader'),
        statsPanel: document.getElementById('dashboard-stats'),
        coachLabel: document.getElementById('coach-name'),
        scoreLabel: document.getElementById('team-score')
    };

    try {
        const coach = await Service.authCoach();
        ui.coachLabel.textContent = coach.name;

        const rawAthletes = await Service.getAthletes(coach.id);
        const fragment = document.createDocumentFragment();
        
        rawAthletes.forEach((athlete, index) => {
            const card = createAthleteCard(athlete);
            card.style.animationDelay = `${index * 100}ms`; 
            fragment.appendChild(card);
        });

        // Calculamos métricas 
        const teamScore = await Service.calculateMetrics(rawAthletes);
        ui.scoreLabel.textContent = `${teamScore}`;

        // Montaje final en DOM
        ui.loader.classList.add('hidden');
        ui.statsPanel.classList.remove('hidden');
        ui.grid.appendChild(fragment);

    } catch (error) {
        console.error("Critical Failure:", error);
        ui.loader.innerHTML = `<p style="color: #ef4444">Error de conexión. Intente recargar.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);