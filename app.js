// --- SERVICES (MOCK API) ---

const authenticateCoach = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ id: 101, name: "Head Coach Memo" }), 800);
    });
};

const getAthletes = (coachId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const athletes = [
                { id: 1, user: "jUAn pErez", status: "inactive", points: 45 },
                { id: 2, user: "mArIa gArCiA", status: "active", points: 88 },
                { id: 3, user: "cArLoS rOdrIguEz", status: "inactive", points: 12 },
                { id: 4, user: "lUciA fErNAnDeZ", status: "active", points: 95 },
                { id: 5, user: "pAbLo mArTiN", status: "inactive", points: 30 }
            ];
            resolve(athletes);
        }, 1200);
    });
};

const calculateTeamMetrics = (athletes) => {
    return new Promise((resolve) => {
        const total = athletes.reduce((acc, curr) => acc + curr.points, 0);
        const average = (total / athletes.length).toFixed(1);
        resolve(average);
    });
};

// --- DOM FACTORY ---

const createAthleteCard = (athlete) => {
    const card = document.createElement('div');
    const isActive = athlete.status === 'active';
    const levelClass = athlete.level === 'Elite' ? 'badge-elite' : 'badge-amateur';
    
    card.className = `card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
        <div>
            <h3>${athlete.formattedName}</h3>
            <span class="badge ${levelClass}">${athlete.level} (${athlete.points} pts)</span>
            <p>Estado: <strong class="status-text">${athlete.status}</strong></p>
        </div>
        <button ${isActive ? 'disabled' : ''}>
            ${isActive ? '✔ Activo' : 'Activar Atleta'}
        </button>
    `;

    // Event Listener
    const btn = card.querySelector('button');
    const statusTxt = card.querySelector('.status-text');

    btn.addEventListener('click', () => {
        athlete.status = 'active'; // Update Data
        // Update View
        card.classList.add('active');
        statusTxt.textContent = 'active';
        btn.textContent = '✔ Activo';
        btn.disabled = true;
    });

    return card;
};

// --- MAIN CONTROLLER ---

async function loadDashboard() {
    const ui = {
        container: document.getElementById('athletes-container'),
        statusMsg: document.getElementById('status-message'),
        dashboardInfo: document.getElementById('dashboard-info'),
        coachName: document.getElementById('coach-name'),
        teamScore: document.getElementById('team-score')
    };

    try {
        ui.statusMsg.textContent = "Autenticando...";
        const coach = await authenticateCoach();
        ui.coachName.textContent = coach.name;

        ui.statusMsg.textContent = "Cargando atletas...";
        const rawData = await getAthletes(coach.id);

        const processedData = rawData.map(a => ({
            ...a,
            formattedName: a.user.toUpperCase(),
            level: a.points > 50 ? 'Elite' : 'Amateur'
        }));

        const avgScore = await calculateTeamMetrics(processedData);
        ui.teamScore.textContent = `${avgScore} pts`;
        ui.dashboardInfo.classList.remove('hidden');

        // Render
        ui.statusMsg.classList.add('hidden');
        const fragment = document.createDocumentFragment();
        
        processedData.forEach(athlete => {
            fragment.appendChild(createAthleteCard(athlete));
        });

        ui.container.appendChild(fragment);

    } catch (error) {
        console.error("System Error:", error);
        ui.statusMsg.textContent = "Error de conexión.";
        ui.statusMsg.className = "error";
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);