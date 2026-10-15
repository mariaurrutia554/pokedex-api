// 1. Referenciar elementos de la interfaz (DOM)
const input = document.getElementById('pokemon-input');
const button = document.getElementById('search-btn');
const cardContainer = document.getElementById('pokemon-card');

// 2. Función asíncrona para conectar con la API de Pokémon
async function getPokemon(pokemonName) {
    try {
        const cleanName = pokemonName.trim().toLowerCase();
        
        const response = await fetch(`https://pokeapi.co{cleanName}`);
        
        if (!response.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const data = await response.json();
        renderPokemonCard(data);

    } catch (error) {
        showError(error.message);
    }
}

// 3. Función para pintar los datos, colores y estadísticas
function renderPokemonCard(pokemon) {
    cardContainer.style.display = 'block';
    
    // Reiniciar las clases CSS para borrar el color del Pokémon anterior
    cardContainer.className = 'card'; 

    const name = pokemon.name.toUpperCase();
    const id = pokemon.id;
    const sprite = pokemon.sprites.front_default;
    
    // Procesar tipos elementales
    const typesArray = pokemon.types.map(t => t.type.name);
    const mainType = typesArray[0]; // El primer tipo define el color de fondo
    const typesText = typesArray.join(', ');

    // Extraer estadísticas de combate base
    const hp = pokemon.stats.find(s => s.stat.name === 'hp').base_stat;
    const attack = pokemon.stats.find(s => s.stat.name === 'attack').base_stat;
    const defense = pokemon.stats.find(s => s.stat.name === 'defense').base_stat;

    // Asignar el tipo principal como clase de estilos
    cardContainer.classList.add(mainType);

    // Inyectar el diseño de la tarjeta
    cardContainer.innerHTML = `
        <h2>#${id} - ${name}</h2>
        <img src="${sprite}" alt="${name}">
        <br>
        <p class="pokemon-types"><strong>Tipo(s):</strong> ${typesText}</p>
        
        <div class="stats-container">
            <div class="stat-row">
                <span class="stat-name">Vida:</span>
                <span class="stat-num">${hp}</span>
                <div class="stat-bar"><div class="bar-fill" style="width: ${Math.min(hp, 100)}%"></div></div>
            </div>
            <div class="stat-row">
                <span class="stat-name">Ataque:</span>
                <span class="stat-num">${attack}</span>
                <div class="stat-bar"><div class="bar-fill" style="width: ${Math.min(attack, 100)}%"></div></div>
            </div>
            <div class="stat-row">
                <span class="stat-name">Defensa:</span>
                <span class="stat-num">${defense}</span>
                <div class="stat-bar"><div class="bar-fill" style="width: ${Math.min(defense, 100)}%"></div></div>
            </div>
        </div>
    `;
}

// 4. Función para renderizar errores en pantalla
function showError(message) {
    cardContainer.style.display = 'block';
    cardContainer.className = 'card'; // Resetea colores de fondo
    cardContainer.innerHTML = `<p style="color: #ff1c1c; font-weight: bold;">⚠️ ${message}</p>`;
}

// 5. Escuchadores de eventos para iniciar la búsqueda
button.addEventListener('click', () => {
    if (input.value.trim() !== "") {
        getPokemon(input.value);
    }
});

input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && input.value.trim() !== "") {
        getPokemon(input.value);
    }
});
