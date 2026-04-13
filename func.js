const typeSelect = document.getElementById('typeSelect');
const typeIcon = document.getElementById('typeIcon');
const searchForm = document.getElementById('searchForm')
const clearBtn = document.getElementById('clearBtn');

const typeColor = {
    "normal": "#9FA19F",
    "fire": "#E62829",
    "water": "#2980EF",
    "electric": "#FAC000",
    "grass": "#3FA129",
    "ice": "#3DCEF3",
    "fighting": "#FF8000",
    "poison": "#9141CB",
    "ground": "#915121",
    "flying": "#81B9EF",
    "psychic": "#EF4179",
    "bug": "#91A119",
    "rock": "#AFA981",
    "ghost": "#704170",
    "dragon": "#5060E1",
    "dark": "#624D4E",
    "steel": "#60A1B8",
    "fairy": "#EF70EF"
}

typeSelect.addEventListener('change', updateType)
function updateType(){
    const selectedType = typeSelect.value;

    if (selectedType) {
        typeIcon.src = `assets/30px-${selectedType}_icon.png`;
        typeWrapper.style.backgroundColor = typeColor[selectedType]; 
    } else {
        typeIcon.src = 'assets/None.png'; 
        typeWrapper.style.backgroundColor = "#68A090";
    }
};

function isFormDirty() {
    const formData = new FormData(searchForm)
    return !Array.from(formData.values()).some(value => value.toString().trim() !== "");
}

searchForm.addEventListener('input', () => {
    const formData = new FormData(searchForm)
    const isDirty = !Array.from(formData.values()).some(value => value.toString().trim() !== "");
    clearBtn.style.display = isDirty ? "block" : "none";
})

clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    typeSelect.value = ""
    updateType()
    clearBtn.style.display = "none";
})