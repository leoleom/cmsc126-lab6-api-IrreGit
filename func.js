// Grab essential DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const pokemonContainer = document.getElementById('pokemonContainer');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error');
const randomBtn = document.getElementById('randomBtn');
const clearBtn = document.getElementById('clearBtn');
const typeSelect = document.getElementById('typeSelect');
const evolutionContainer = document.getElementById('evolutionContainer');

// Main fetch function
async function fetchPokemon(query) {
    if (!query) return; // Do nothing if input is empty

    // 1. Show loading, hide error, and clear previous results
    loadingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    pokemonContainer.innerHTML = ''; 
    evolutionContainer.innerHTML = '';

    try {
        const formattedQuery = query.toLowerCase().trim();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);

        if (!response.ok) {
            throw new Error('Pokémon not found');
        }

        const data = await response.json();
        
        // Hide loading and show the new data
        loadingSection.classList.add('hidden');
        renderPokemon(data);

        // Fetch and display the evolution chain
        fetchEvolutionChain(data.species.url);

    } catch (error) {
        console.error("API Error:", error);
        
        // Hide loading and show the error message
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
            <p><strong>Abilities:</strong> ${abilities}</p>
            <p><strong>Hidden:</strong> ${hiddenList}</p>
            <p><strong>Height:</strong> ${height} m</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
        </div>
    `;

    // Inject the HTML into the container
    pokemonContainer.innerHTML += cardHTML;
}

async function fetchEvolutionChain(speciesUrl) {
    try {
        // Fetch the Species data
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        // Fetch the Evolution Chain data
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Dig through the nested 'chain' object
        let currentEvolution = evolutionData.chain;
        let evolutionPathHTML = '';

        // Standard while loop to trace the 'evolves_to' array
        while (currentEvolution) {
            const speciesName = currentEvolution.species.name;
            
            // Fetch the image for this specific evolution stage
            const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`);
            const pokeData = await pokeResponse.json();
            const spriteUrl = pokeData.sprites.front_default;
            
            // Build the HTML including an <img> tag
            evolutionPathHTML += `
                <div class="evo-stage">
                    <img src="${spriteUrl}" alt="${speciesName}">
                    <p>${speciesName.toUpperCase()}</p>
                </div>
            `;

            // If there is another evolution, add an arrow and move down the chain
            if (currentEvolution.evolves_to.length > 0) {
                evolutionPathHTML += ` <div class="evo-arrow">➔</div> `;
                currentEvolution = currentEvolution.evolves_to[0]; 
            } else {
                // No more evolutions, break the loop
                currentEvolution = null; 
            }
        }

        // Display the HTML in the container
        evolutionContainer.innerHTML = `<div class="evo-wrapper">${evolutionPathHTML}</div>`;

    } catch (error) {
        console.error("Evolution Error:", error);
        evolutionContainer.innerHTML = '<p>Evolution data unavailable.</p>';
    }
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
    evolutionContainer.innerHTML = '';
    
    // Ensure error and loading messages are hidden
    errorSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
});

// Dropdown Filter Logic
typeSelect.addEventListener('change', async (event) => {
    const selectedType = event.target.value;
    
    // If they change it back to the default "Select Pokémon Type" option, do nothing
    if (!selectedType) return; 

    // Reset UI for a fresh search
    loadingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    pokemonContainer.innerHTML = ''; 
    evolutionContainer.innerHTML = '';
    searchInput.value = ''; // Clear the text input to avoid confusion

    try {
        // Fetch the list of Pokémon that have this type
        const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        if (!response.ok) throw new Error('Type not found');
        
        const data = await response.json();
        
        // Some types have hundreds of Pokémon. Let's just grab the first 6 so the browser doesn't freeze!
        const pokemonList = data.pokemon.slice(0, 6);
        
        // Loop through the list and fetch the details for each one
        for (let i = 0; i < pokemonList.length; i++) {
            const pokeName = pokemonList[i].pokemon.name;
            
            // Fetch the specific data for this Pokémon
            const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
            const pokeData = await pokeResponse.json();
            
            // Reuse our render function (it will now add 6 cards side-by-side)
            renderPokemon(pokeData);
        }
        
        loadingSection.classList.add('hidden');
        
    } catch (error) {
        console.error("API Error:", error);
        loadingSection.classList.add('hidden');
        errorSection.classList.remove('hidden');
    }
});

// Show Gen 1 Button Logic
const gen1Btn = document.getElementById('gen1Btn');

// Safety check ensures the code only runs if the button actually exists in HTML
if (gen1Btn) {
    gen1Btn.addEventListener('click', async () => {
        // Reset the UI
        loadingSection.classList.remove('hidden');
        errorSection.classList.add('hidden');
        pokemonContainer.innerHTML = '';
        if (evolutionContainer) evolutionContainer.innerHTML = '';
        searchInput.value = '';

        try {
            // Fetch the list of the first 151 Pokémon
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
            const data = await response.json();
            
            // Loop through and fetch details for each one
            for (let i = 0; i < data.results.length; i++) {
                const pokeName = data.results[i].name;
                const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
                const pokeData = await pokeResponse.json();
                renderPokemon(pokeData);
            }
            
            loadingSection.classList.add('hidden');
        } catch (error) {
            console.error("API Error:", error);
            loadingSection.classList.add('hidden');
            errorSection.classList.remove('hidden');
        }
    });
}