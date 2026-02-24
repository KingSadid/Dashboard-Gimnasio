// --- SIMULACIÓN DE BACKEND ---

/**
 * Simula una petición a una API para obtener atletas.
 * @returns {Promise<Array>}
 */
const getAthletes = () => {
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

// --- LÓGICA DE UI Y NEGOCIO ---

/**
 * Crea el elemento HTML (tarjeta) para un atleta.
 * @param {Object} athlete - Objeto con datos formateados del atleta
 * @returns {HTMLElement} - El nodo del DOM listo para insertar
 */
const createAthleteCard = (athlete) => {
    const card = document.createElement('div');
    card.className = `card ${athlete.status === 'active' ? 'active' : ''}`;
    card.id = `card-${athlete.id}`;

    // Determinamos si el botón debe estar deshabilitado inicialmente
    const isAlreadyActive = athlete.status === 'active';
    const btnText = isAlreadyActive ? '✔ Activo' : 'Comprar Membresía';

    card.innerHTML = `
        <div>
            <h3>${athlete.formattedName}</h3>
            <span class="badge ${athlete.level === 'Elite' ? 'badge-elite' : 'badge-amateur'}">
                ${athlete.level} (${athlete.points} pts)
            </span>
            <p>Estado: <strong class="status-text">${athlete.status}</strong></p>
        </div>
        <button class="btn-action" ${isAlreadyActive ? 'disabled' : ''}>
            ${btnText}
        </button>
    `;

    // Lógica del botón (Closure para mantener referencia al objeto)
    const button = card.querySelector('button');
    const statusText = card.querySelector('.status-text');

    button.addEventListener('click', () => {
        // 1. Actualizar estado del objeto (Simulación de persistencia)
        athlete.status = 'active';

        // 2. Manipulación del DOM para reflejar el cambio
        card.classList.add('active');
        statusText.textContent = 'active';
        
        // 3. Feedback visual en el botón
        button.textContent = '✔ Activo';
        button.disabled = true; // Evitar doble compra
        button.style.backgroundColor = 'var(--success)';
    });

    return card;
};

/**
 * Función Principal asíncrona
 */
async function loadDashboard() {
    const container = document.getElementById('athletes-container');
    const statusMsg = document.getElementById('status-message');

    try {
        // 1. Llamada asíncrona
        const rawData = await getAthletes();

        // Limpiamos mensaje de carga
        statusMsg.classList.add('hidden');

        // 2. Transformación de datos (Map)
        // Creamos una estructura intermedia con los datos procesados y el elemento HTML
        const processedAthletes = rawData.map(athlete => {
            // Lógica de negocio
            const formattedName = athlete.user.toUpperCase();
            const level = athlete.points > 50 ? 'Elite' : 'Amateur';

            // Retornamos un objeto enriquecido
            const enrichedAthlete = {
                ...athlete, // Spread operator para mantener props originales
                formattedName,
                level
            };

            // Generamos el HTML basado en este objeto enriquecido
            const htmlElement = createAthleteCard(enrichedAthlete);

            return htmlElement;
        });

        // 3. Inserción en el DOM (ForEach)
        processedAthletes.forEach(cardNode => {
            container.appendChild(cardNode);
        });

    } catch (error) {
        console.error("Error crítico en el sistema:", error);
        statusMsg.textContent = "Error al cargar los datos. Por favor intente más tarde.";
        statusMsg.style.color = "red";
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', loadDashboard);