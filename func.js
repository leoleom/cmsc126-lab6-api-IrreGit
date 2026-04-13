// Grab essential DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const pokemonContainer = document.getElementById('pokemonContainer');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error');
const randomBtn = document.getElementById('randomBtn');
const clearBtn = document.getElementById('clearBtn');

// Main fetch function
async function fetchPokemon(query) {
    if (!query) return; // Do nothing if input is empty

    // 1. Show loading, hide error, and clear previous results
    loadingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    pokemonContainer.innerHTML = ''; 

    try {
        const formattedQuery = query.toLowerCase().trim();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);

        if (!response.ok) {
            throw new Error('Pokémon not found');
        }

        const data = await response.json();
        
        // 2. Hide loading and show the new data
        loadingSection.classList.add('hidden');
        renderPokemon(data);

    } catch (error) {
        console.error("API Error:", error);
        
        // 3. Hide loading and show the error message
        loadingSection.classList.add('hidden');
        errorSection.classList.remove('hidden');
    }
}

// Event Listeners for the Search Button and Enter Key
searchBtn.addEventListener('click', () => {
    fetchPokemon(searchInput.value);
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchPokemon(searchInput.value);
    }
});

function renderPokemon(pokemon) {
    // Extract the specific data points needed from JSON
    const name = pokemon.name;
    const id = pokemon.id;
    const sprite = pokemon.sprites.front_default; 
    
    // Extract types
    const typesList = [];
    for (let i = 0; i < pokemon.types.length; i++) {
        typesList.push(pokemon.types[i].type.name);
    }
    const types = typesList.join(', ');
    
    // Convert API units (decimeters and hectograms) to meters and kg
    const height = pokemon.height / 10; 
    const weight = pokemon.weight / 10; 

    // Build the HTML structure for the card
    const cardHTML = `
        <div class="pokemon-card">
            <img src="${sprite}" alt="${name} sprite">
            <h3>#${id} - ${name.toUpperCase()}</h3>
            <p><strong>Type:</strong> ${types}</p>
            <p><strong>Height:</strong> ${height} m</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
        </div>
    `;

    // Inject the HTML into the container
    pokemonContainer.innerHTML = cardHTML;
}

// Random Button Logic
randomBtn.addEventListener('click', () => {
    // Generate a random number between 1 and 1025 (total Pokémon in the National Dex)
    const randomId = Math.floor(Math.random() * 1025) + 1;
    
    // Update the input field so the user sees the ID, then fetch it
    searchInput.value = randomId; 
    fetchPokemon(randomId.toString()); 
});

// Clear Button Logic
clearBtn.addEventListener('click', () => {
    // Empty the input field and the display container
    searchInput.value = '';
    pokemonContainer.innerHTML = '';
    
    // Ensure error and loading messages are hidden
    errorSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
});