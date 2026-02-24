// --- SERVICES ---
// (Mismas funciones de promesa que el anterior, sin cambios lógicos)
const authenticateCoach = () => new Promise(r => setTimeout(() => r({ id: 101, name: "Memo Coach" }), 800));

const getAthletes = (coachId) => new Promise(r => {
    setTimeout(() => {
        r([
            { id: 1, user: "jUAn pErez", status: "inactive", points: 45 },
            { id: 2, user: "mArIa gArCiA", status: "active", points: 88 },
            { id: 3, user: "cArLoS rOdrIguEz", status: "inactive", points: 12 },
            { id: 4, user: "lUciA fErNAnDeZ", status: "active", points: 95 },
            { id: 5, user: "pAbLo mArTiN", status: "inactive", points: 30 }
        ]);
    }, 1500); // Un poco más de tiempo para apreciar el loader
});

const calculateTeamMetrics = (athletes) => new Promise(r => {
    const avg = (athletes.reduce((acc, c) => acc + c.points, 0) / athletes.length).toFixed(1);
    r(avg);
});

// --- DOM FACTORY ---

const createAthleteCard = (athlete) => {
    const card = document.createElement('div');
    const isActive = athlete.status === 'active';
    const levelClass = athlete.level === 'Elite' ? 'badge-elite' : 'badge-amateur';
    
    // Agregamos clase 'fade-in' para animación de entrada
    card.className = `card fade-in ${isActive ? 'active' : ''}`;
    
    card.innerHTML = `
        <div class="card-header">
            <h3>${athlete.formattedName}</h3>
            <div class="meta">
                <span class="badge ${levelClass}">${athlete.level}</span>
                <span style="font-size:0.8rem; color:#94a3b8">PTS: ${athlete.points}</span>
            </div>
        </div>

        <div class="status-row">
            <span class="status-dot"></span>
            <span>Estado: <strong class="status-text">${athlete.status.toUpperCase()}</strong></span>
        </div>

        <button ${isActive ? 'disabled' : ''}>
            ${isActive ? 'Suscripción Activa' : 'Activar Membresía'}
        </button>
    `;

    // Lógica del botón
    const btn = card.querySelector('button');
    const statusTxt = card.querySelector('.status-text');

    btn.addEventListener('click', () => {
        // Update Logic
        athlete.status = 'active';
        
        // Update UI
        card.classList.add('active');
        statusTxt.textContent = 'ACTIVE';
        btn.textContent = 'Procesando...'; // Micro-interacción
        
        // Simulamos un pequeño delay de proceso para realismo
        setTimeout(() => {
            btn.textContent = 'Suscripción Activa';
            btn.disabled = true;
        }, 500);
    });

    return card;
};

// --- MAIN ---
async function loadDashboard() {
    const ui = {
        container: document.getElementById('athletes-container'),
        loader: document.getElementById('status-message'),
        dashboardInfo: document.getElementById('dashboard-info'),
        coachName: document.getElementById('coach-name'),
        teamScore: document.getElementById('team-score')
    };

    try {
        const coach = await authenticateCoach();
        ui.coachName.textContent = coach.name;

        const rawData = await getAthletes(coach.id);

        const processedData = rawData.map(a => ({
            ...a,
            formattedName: a.user.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Capitalización Correcta (Title Case)
            level: a.points > 50 ? 'Elite' : 'Amateur'
        }));

        const avgScore = await calculateTeamMetrics(processedData);
        
        // Animación de números (Opcional visual)
        ui.teamScore.textContent = `${avgScore}`;
        ui.dashboardInfo.classList.remove('hidden');

        // Limpiar loader y renderizar
        ui.loader.classList.add('hidden');
        
        processedData.forEach((athlete, index) => {
            // Pequeño delay escalonado para efecto cascada en la animación
            setTimeout(() => {
                ui.container.appendChild(createAthleteCard(athlete));
            }, index * 100);
        });

    } catch (error) {
        console.error(error);
        ui.loader.innerHTML = `<p style="color:var(--danger)">⚠ Error de conexión</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);