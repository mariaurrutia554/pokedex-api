const input = document.getElementById('pokemon-input');
const button = document.getElementById('search-btn');
const cardContainer = document.getElementById('pokemon-card');

async function getPokemon(pokemonName) {
    try {
        const name = pokemonName.trim().toLowerCase();
        // DIRECCIÓN CORREGIDA AQUÍ
        const response = await fetch('https://pokeapi.co' + name);
        
        if (!response.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const data = await response.json();
        renderPokemonCard(data);

    } catch (error) {
        showError(error.message);
    }
}

function renderPokemonCard(pokemon) {
    cardContainer.style.display = 'block';
    cardContainer.className = 'card'; 

    const name = pokemon.name.toUpperCase();
    const id = pokemon.id;
    const sprite = pokemon.sprites.front_default;
    
    const typesArray = pokemon.types.map(t => t.type.name);
    const mainType = typesArray[0]; 
    const typesText = typesArray.join(', ');

    // ESTADÍSTICAS CORREGIDAS PARA QUE LEA LOS VALORES REALES
    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;

    cardContainer.classList.add(mainType);

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

function showError(message) {
    cardContainer.style.display = 'block';
    cardContainer.className = 'card'; 
    cardContainer.innerHTML = `<p style="color: #ff1c1c; font-weight: bold;">⚠️ ${message}</p>`;
}

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
