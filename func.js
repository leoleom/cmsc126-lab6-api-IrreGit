// Grab essential DOM elements
const typeSelect = document.getElementById('typeSelect');
const searchInput = document.getElementById('searchInput');

// butts
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const clearBtn = document.getElementById('clearBtn');

// results - shown when searching or random
const results = document.getElementById('results');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error');
const pokemonContainer = document.getElementById('pokemonContainer');

const pageUI = document.getElementById('paginationSection');
const nextBtn = document.getElementById('nextBtn');
const pageNumber = document.getElementById('pageNumber');
const prevBtn = document.getElementById('prevBtn');


// evolution - should only be shown when searching for a specific pokemon
const evolution = document.getElementById('evolutionSection');
const evolutionContainer = document.getElementById('evolutionContainer');

// directly added file path to image
const typePokemon = {
    "normal": {"color": "#9FA19F", "image": "assets/30px-Normal_icon.png"},
    "fire": {"color": "#E62829", "image": "assets/30px-Fire_icon.png"},
    "water": {"color": "#2980EF", "image": "assets/30px-Water_icon.png"},
    "electric": {"color": "#FAC000", "image": "assets/30px-Electric_icon.png"},
    "grass": {"color": "#3FA129", "image": "assets/30px-Grass_icon.png"},
    "ice": {"color": "#3DCEF3", "image": "assets/30px-Ice_icon.png"},
    "fighting": {"color": "#FF8000", "image": "assets/30px-Fighting_icon.png"},
    "poison": {"color": "#9141CB", "image": "assets/30px-Poison_icon.png"},
    "ground": {"color": "#915121", "image": "assets/30px-Ground_icon.png"},
    "flying": {"color": "#81B9EF", "image": "assets/30px-Flying_icon.png"},
    "psychic": {"color": "#EF4179", "image": "assets/30px-Psychic_icon.png"},
    "bug": {"color": "#91A119", "image": "assets/30px-Bug_icon.png"},
    "rock": {"color": "#AFA981", "image": "assets/30px-Rock_icon.png"},
    "ghost": {"color": "#704170", "image": "assets/30px-Ghost_icon.png"},
    "dragon": {"color": "#5060E1", "image": "assets/30px-Dragon_icon.png"},
    "dark": {"color": "#624D4E", "image": "assets/30px-Dark_icon.png"},
    "steel": {"color": "#60A1B8", "image": "assets/30px-Steel_icon.png"},
    "fairy": {"color": "#EF70EF", "image": "assets/30px-Fairy_icon.png"}
}

function updateType(){
    const selectedType = typeSelect.value;

    if (selectedType) {
        typeIcon.src = typePokemon[selectedType].image;
        typeWrapper.style.backgroundColor = typePokemon[selectedType].color; 
    } else {
        typeIcon.src = 'assets/None.png'; 
        typeWrapper.style.backgroundColor = "#68A090";
    }
};

async function filterType(selectedType) {
    if (selectedType){
        const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const typeData = await typeRes.json();
        return typeMatch = typeData.pokemon.map(p => p.pokemon);
    } else {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
        const data = await res.json();
        return data.results;

    }
}

/* ===== FETCHING ===== */
async function fetchPokemon(query, selectedType) {
    updateClearButton();
    // 1. Show loading, hide error, and clear previous results
    loadingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');

    pageUI.style.display = "none";
    results.style.display = "none";
    evolution.style.display = "none";
    pokemonContainer.innerHTML = ''; 
    evolutionContainer.innerHTML = '';

    try {
        const searchTerm = query.toLowerCase().trim();

        // if index lookup: immediately return the pokemon + evos
        const isIndexSearch = searchTerm !== '' && !isNaN(searchTerm)
        if (isIndexSearch){
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}/`);
            if (!res.ok) throw new Error();
            const data = await res.json();

            loadingSection.classList.add('hidden');
            renderPokemon(data);
            results.style.display = "inline-block";

            fetchEvolutionChain(data.species.url)
            evolution.style.display = "inline-block";
            return;
        }

        // else, filter by type (if any)
        let pokemonList = await filterType(selectedType);
        currentMatches = pokemonList
        .filter(p => p.name.includes(searchTerm))

        if (currentMatches.length === 0) throw new Error('No Pokémon found');

        // display if matches
        results.style.display = "inline-block";

        if (currentMatches.length === 1) {
            const res = await fetch(currentMatches[0].url);
            if (!res.ok) throw new Error();
            const data = await res.json();

            loadingSection.classList.add('hidden');
            renderPokemon(data);

            fetchEvolutionChain(data.species.url)
            evolution.style.display = "inline-block";
            return
        }

        currentPage = 1
        renderCurrentPage();
        pageNumber.max = Math.ceil(currentMatches.length/itemsPerPage);
        pageUI.style.display = (currentMatches.length > itemsPerPage)? "block": "none";

    } catch (error) {
        console.error("API Error:", error);
        
        // Hide loading and show the error message
        loadingSection.classList.add('hidden');
        errorSection.classList.remove('hidden');
        results.style.display = "none";
        evolution.style.display = "none";
    }
}

function renderPokemon(pokemon) {
    // Extract the specific data points needed from JSON
    const name = pokemon.name;
    const id = pokemon.id;
    const sprite = pokemon.sprites.front_default; 

    // Extract abilities
    const abilitiesList = [];
    const hiddenList = [];

    for (let i = 0; i < pokemon.abilities.length; i++) {
        if(!pokemon.abilities[i].is_hidden)
            abilitiesList.push(pokemon.abilities[i].ability.name);
        else
            hiddenList.push(pokemon.abilities[i].ability.name);
    }

    const abilities = abilitiesList.join(', ');
    
    // Extract types (modified to be more visually appealing)
    const typesHTML = pokemon.types.map(t => {
        const typeName = t.type.name;
        const typeData = typePokemon[typeName];
        return `<span class="type-badge" style="background-color: ${typeData.color}">
            <img src="${typeData.image}" alt="${typeName}" width="20">
            ${typeName}
        </span>`;
    }).join(' ')


    // Convert API units (decimeters and hectograms) to meters and kg
    const height = pokemon.height / 10; 
    const weight = pokemon.weight / 10; 

    // Build the HTML structure for the card
    const cardHTML = `
        <div class="pokemon-card">
            <img src="${sprite}" alt="${name} sprite" class="card-sprite">
            <h3 class="pokemon-name">#${id} - ${name.toUpperCase()}</h3>
            <p class="card-type"><strong>Type:</strong> ${typesHTML}</p>
            <p class="card-abilities"><strong>Abilities:</strong> ${abilities}</p>
            <p class="card-hidden"><strong>Hidden:</strong> ${hiddenList}</p>
            <p class="card-height"><strong>Height:</strong> ${height} m</p>
            <p class="card-weight"><strong>Weight:</strong> ${weight} kg</p>
        </div>
    `;

    // Inject the HTML into the container
    pokemonContainer.insertAdjacentHTML('beforeend', cardHTML);
}

async function fetchEvolutionChain(speciesUrl) {
    try {
        // Fetch the Species data
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        // Fetch the Evolution Chain data
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // made into a recursive function for each evolution
        async function getEvoData(chain) {
            const speciesName = chain.species.name;
            const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`);
            const pokeData = await pokeResponse.json();
            const spriteUrl = pokeData.sprites.front_default;
            
            const html = `
                <div class="evo-stage">
                    <img src="${spriteUrl}" alt="${speciesName}" class="card-sprite">
                    <p>${speciesName.toUpperCase()}</p>
                </div>
            `;
            if (chain.evolves_to.length > 0) {
                const branches = await Promise.all(
                    chain.evolves_to.map(branch => getEvoData(branch))
                );
                return `
                    <div class="evo-node">
                        ${html}
                        <div class="evo-branches">
                            ${branches.map(b => 
                                `<div class="evo-branch"><div class="evo-arrow">➔</div>${b}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
            return html
        }

        const fullChainHTML = await getEvoData(evolutionData.chain);
        evolutionContainer.innerHTML = `<div class="evo-wrapper">${fullChainHTML}</div>`;

    } catch (error) {
        console.error("Evolution Error:", error);
        evolutionContainer.innerHTML = '<p>Evolution data unavailable.</p>';
    }
}


/* ===== Rendering page ===== */
let currentMatches = [];
let currentPage = 1;
const itemsPerPage = 12;

async function renderCurrentPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = currentMatches.slice(start, end);

    const detailedData = await Promise.all(
        items.map(p => fetch(p.url).then(res => res.json()))
    );

    loadingSection.classList.add('hidden');
    pokemonContainer.innerHTML = '';
    detailedData.forEach(poke => renderPokemon(poke));

    pageNumber.value = currentPage;
    prevBtn.style.display = (currentPage > 1)? "inline-block": "none";
    nextBtn.style.display = (currentPage === Math.ceil(currentMatches.length / itemsPerPage)) ? "none": "inline-block";
}


/* ===== ACTION LISTENER FUNCTIONS ===== */

function handleSearch(event) {
    if (event) 
        event.preventDefault();

    fetchPokemon(searchInput.value, typeSelect.value);
}

function handleTypeChange(event) {
    updateType();
    const selectedType = event.target.value;
    if (!selectedType) {
        results.style.display = "none";
        pokemonContainer.innerHTML = '';
        return;
    }
    fetchPokemon('', selectedType);
}

// Random Button Logic
async function handleRandom() {
    const filtered = await filterType(typeSelect.value)
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    const res = await fetch(random.url)
    if (!res.ok) throw new Error();
    const data = await res.json();
    searchInput.value = data.id; 
    
    fetchPokemon(data.id.toString(), typeSelect.value); 
}

// combined the two functions to one
function handleClear() {
    evolution.style.display = "none";
    pageUI.style.display = "none";

    searchInput.value = '';
    typeSelect.value = '';
    updateType();

    errorSection.classList.add('hidden');
    loadingSection.classList.add('hidden');

    evolutionContainer.innerHTML = '';
    currentPage = 1;

    fetchPokemon('', '');
    updateClearButton();
}

// navigating the results
function handlePrev() {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
}

function handleNext() {
    currentPage++;
    renderCurrentPage();
}

function handlePageInput(input) {
    const max = parseInt(input.max);
    const min = parseInt(input.min);
    const value = parseInt(input.value);

    if (value > max) {
        input.value = max;
    } else if (value < min) {
        input.value = min;
    } else {
        currentPage = value;
        renderCurrentPage();
    }
}

function handleFormInput() {
    const isDirty = searchInput.value.trim() !== '' || typeSelect.value !== '';
    updateClearButton();
}


// helper for clearing
function updateClearButton() {
    const isDirty = searchInput.value.trim() !== '' || typeSelect.value !== '';
    clearBtn.style.display = isDirty ? "block" : "none";
}

fetchPokemon('', '');
updateClearButton();
