
const API = "https://pokeapi.co/api/v2/pokemon/";

const grid = document.getElementById("pokemon-grid");
const statusText = document.getElementById("status");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const resetButton = document.getElementById("reset-button");
const dialog = document.getElementById("pokemon-dialog");
const detail = document.getElementById("pokemon-detail");

let offset = 0;
const PAGE_SIZE = 24;
let requestVersion = 0;

const statNames = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. especial",
  "special-defense": "Def. especial",
  speed: "Velocidad"
};

const typeNames = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada"
};

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatName(name) {
  return name.split("-").map(capitalize).join(" ");
}

function formatNumber(number) {
  return "#" + String(number).padStart(4, "0");
}

async function getPokemon(identifier) {
  const response = await fetch(
    API + encodeURIComponent(String(identifier).toLowerCase().trim())
  );

  if (!response.ok) {
    throw new Error("Pokémon no encontrado.");
  }

  return response.json();
}

function createCard(pokemon) {
  const card = document.createElement("article");
  card.className = "pokemon-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `Ver detalles de ${pokemon.name}`
  );

  const image =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default;

  const number = document.createElement("div");
  number.className = "pokemon-number";
  number.textContent = formatNumber(pokemon.id);

  const img = document.createElement("img");
  img.src = image || "";
  img.alt = pokemon.name;
  img.loading = "lazy";

  const name = document.createElement("h2");
  name.className = "pokemon-name";
  name.textContent = formatName(pokemon.name);

  const types = document.createElement("div");
  types.className = "types";

  pokemon.types.forEach(({ type }) => {
    const badge = document.createElement("span");
    badge.className = `type type-${type.name}`;
    badge.textContent = typeNames[type.name] || capitalize(type.name);
    types.appendChild(badge);
  });

  card.append(number, img, name, types);

  function openDetails() {
    showDetails(pokemon);
  }

  card.addEventListener("click", openDetails);
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  });

  return card;
}

async function loadPokemon(reset = false) {
  const version = ++requestVersion;

  if (reset) {
    offset = 0;
    grid.replaceChildren();
  }

  loadMoreButton.disabled = true;
  statusText.textContent = "Cargando Pokémon...";

  try {
    const response = await fetch(
      `${API}?limit=${PAGE_SIZE}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error("No se pudo conectar con PokeAPI.");
    }

    const data = await response.json();

    // Ignora resultados de búsquedas anteriores.
    if (version !== requestVersion) return;

    const results = await Promise.all(
      data.results.map(item => getPokemon(item.name))
    );

    if (version !== requestVersion) return;

    const fragment = document.createDocumentFragment();

    results.forEach(pokemon => {
      fragment.appendChild(createCard(pokemon));
    });

    grid.appendChild(fragment);
    offset += results.length;

    statusText.textContent =
      `Mostrando ${grid.children.length} Pokémon.`;

    loadMoreButton.hidden = !data.next;
  } catch (error) {
    if (version !== requestVersion) return;

    statusText.textContent =
      "Error al cargar los datos. Revisa tu conexión e inténtalo otra vez.";
    console.error(error);
  } finally {
    if (version === requestVersion) {
      loadMoreButton.disabled = false;
    }
  }
}

async function searchPokemon(query) {
  const version = ++requestVersion;
  const term = query.trim().toLowerCase();

  if (!term) {
    statusText.textContent = "Escribe un nombre o número.";
    return;
  }

  grid.replaceChildren();
  loadMoreButton.hidden = true;
  loadMoreButton.disabled = true;
  statusText.textContent = "Buscando Pokémon...";

  try {
    const pokemon = await getPokemon(term);

    if (version !== requestVersion) return;

    grid.appendChild(createCard(pokemon));
    statusText.textContent = "1 Pokémon encontrado.";
  } catch (error) {
    if (version !== requestVersion) return;

    statusText.textContent =
      "No se encontró ese Pokémon. Prueba con pikachu o 25.";
  } finally {
    if (version === requestVersion) {
      loadMoreButton.disabled = false;
    }
  }
}

function showDetails(pokemon) {
  detail.replaceChildren();

  const image = document.createElement("img");
  image.className = "detail-image";
  image.alt = pokemon.name;
  image.src =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    "";

  const title = document.createElement("h2");
  title.textContent = formatName(pokemon.name);

  const number = document.createElement("p");
  number.className = "pokemon-number";
  number.textContent = formatNumber(pokemon.id);

  const types = document.createElement("div");
  types.className = "types";

  pokemon.types.forEach(({ type }) => {
    const badge = document.createElement("span");
    badge.className = `type type-${type.name}`;
    badge.textContent = typeNames[type.name] || capitalize(type.name);
    types.appendChild(badge);
  });

  const measurements = document.createElement("p");
  measurements.textContent =
    `Altura: ${(pokemon.height / 10).toFixed(1)} m · ` +
    `Peso: ${(pokemon.weight / 10).toFixed(1)} kg`;

  const stats = document.createElement("section");
  stats.className = "stats";

  const statsTitle = document.createElement("h3");
  statsTitle.textContent = "Estadísticas base";
  stats.appendChild(statsTitle);

  pokemon.stats.forEach(item => {
    const row = document.createElement("div");
    row.className = "stat";

    const label = document.createElement("div");
    label.className = "stat-label";

    const statName = document.createElement("span");
    statName.textContent =
      statNames[item.stat.name] || item.stat.name;

    const value = document.createElement("strong");
    value.textContent = item.base_stat;

    label.append(statName, value);

    const track = document.createElement("div");
    track.className = "stat-track";

    const fill = document.createElement("div");
    fill.className = "stat-fill";
    fill.style.width =
      `${Math.min(item.base_stat / 255 * 100, 100)}%`;

    track.appendChild(fill);
    row.append(label, track);
    stats.appendChild(row);
  });

  detail.append(image, title, number, types, measurements, stats);
  dialog.showModal();
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchPokemon(searchInput.value);
});

loadMoreButton.addEventListener("click", () => {
  loadPokemon();
});

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  loadPokemon(true);
});

document.getElementById("close-dialog").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    dialog.close();
  }
});

loadPokemon(true);

