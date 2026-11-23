const supabaseUrl = 'https://xhxdtnkphgzyfxobybfu.supabase.co';
const supabaseKey = 'sb_publishable_RiNMmiLoRH0SFHO-u1i_FQ_JAkGdtQL';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loadAllergens() {
    const response = await supabaseClient
        .from('allergens')
        .select('allergen_name');
        
    const allergens = response.data;
    const error = response.error;

    if (error) {
        console.error("Error fetching allergens:", error);
        return;
    }

    const container = document.getElementById('allergen-checkboxes');
    
    for (let i = 0; i < allergens.length; i++) {
        const item = allergens[i];
        
        const div = document.createElement('div');
        div.className = 'col-6 col-md-2 mb-2';        
        
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item.allergen_name}" id="${item.allergen_name}">
            <label class="form-check-label text-dark" for="${item.allergen_name}">${item.allergen_name}</label>
        `;
        
        container.appendChild(div);


        const allergenEmojis = {
        "Sesame": "🌱", "Egg": "🥚", "Soy": "🫘", "Tree Nut": "🌰", 
        "Shellfish": "🦐", "Seafood": "🐟", "Gluten": "🌾", "Dairy": "🥛", "Nightshade": "🍅",
        "Allium": "🧄", "Meat": "🥩", "Honey": "🍯", 
    };


        const emoji = allergenEmojis[item.allergen_name] 
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item.allergen_name}" id="${item.allergen_name}">
            <span style="margin-right: 5px;">${emoji}</span>
            <label class="form-check-label text-dark" for="${item.allergen_name}">${item.allergen_name}</label>
        `;
            }

}


loadAllergens();