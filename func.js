// Grab essential DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Main fetch function (Console Log version)
async function fetchPokemon(query) {
    if (!query) return; // Do nothing if input is empty

    try {
        // Format the query (API requires lowercase and no extra spaces)
        const formattedQuery = query.toLowerCase().trim();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);

        // If the API returns a 404 (Not Found), throw an error
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }

        // Parse the JSON data
        const data = await response.json();
        console.log("Success! Here is the data:", data);

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