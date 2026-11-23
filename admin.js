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
    
    // Loop through each allergen and create a checkbox for it
    for (let i = 0; i < allergens.length; i++) {
        const item = allergens[i];
        
        const div = document.createElement('div');
        div.className = 'form-check form-check-inline';
        
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item.allergen_name}" id="${item.allergen_name}">
            <label class="form-check-label text-white" for="${item.allergen_name}">${item.allergen_name}</label>
        `;
        
        container.appendChild(div);
    }
}

// Run the function when the page loads
loadAllergens();