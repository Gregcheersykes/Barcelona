const supabaseUrl = 'https://xhxdtnkphgzyfxobybfu.supabase.co';
const supabaseKey = 'sb_publishable_RiNMmiLoRH0SFHO-u1i_FQ_JAkGdtQL';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Function to load allergens and display them with checkboxes and emojis
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

    const allergenEmojis = {
        "Sesame": "🌱", "Egg": "🥚", "Soy": "🫘", "Tree Nut": "🌰", 
        "Shellfish": "🦐", "Seafood": "🐟", "Gluten": "🌾", "Dairy": "🥛", "Nightshade": "🍅",
        "Allium": "🧄", "Meat": "🥩", "Honey": "🍯", 
    };

    for (let i = 0; i < allergens.length; i++) {
        const item = allergens[i];
        
        const div = document.createElement('div');
        div.className = 'col-6 col-md-2 mb-2';        

        const emoji = allergenEmojis[item.allergen_name] || "🍽️";

        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item.allergen_name}" id="${item.allergen_name}">
            <span style="margin-right: 5px;">${emoji}</span>
            <label class="form-check-label text-dark" for="${item.allergen_name}">${item.allergen_name}</label>
        `;

        container.appendChild(div);
    }
}

// Function to load dishes along with their associated allergens
async function loadDishes() {
    const { data: dishes, error } = await supabaseClient
        .from('dishes')
        .select('dish_name, allergens (allergen_name)')
        .order('dish_name', { ascending: true }); // Order dishes by name ascending A-Z

    if (error) {
        console.error("Error fetching dishes:", error);
        return;
    }

    console.log(dishes); 

    const container = document.getElementById('dish-list');
    container.innerHTML = ''; // Clear existing rows before loading

    for (let i = 0; i < dishes.length; i++) { 
        const dish = dishes[i];
        const tr = document.createElement('tr');

        // Safely map allergens if they exist, otherwise display 'None'
        const allergenNames = dish.allergens && dish.allergens.length > 0 
            ? dish.allergens.map(a => a.allergen_name).join(', ') 
            : 'None';

        tr.innerHTML = `
            <td>${dish.dish_name}</td>
            <td>${allergenNames}</td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;

        container.appendChild(tr);
    }
}

// Load dishes and allergens when the page loads
loadDishes();   
loadAllergens();