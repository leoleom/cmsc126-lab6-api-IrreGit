// Grab essential DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const pokemonContainer = document.getElementById('pokemonContainer');

// Main fetch function (Console Log version)
async function fetchPokemon(query) {
    if (!query) return; // Do nothing if input is empty

    try {
        // Format query (API requires lowercase and no extra spaces)
        const formattedQuery = query.toLowerCase().trim();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);

        // If API returns a 404 (Not Found), throw an error
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }

        // Parse the JSON data
        const data = await response.json();
        
        // Send the data to be rendered on the screen
        renderPokemon(data);

    } catch (error) {
        console.error("API Error:", error);
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