// 1. Connect to your Supabase Database
const supabaseUrl = 'https://xhxdtnkphgzyfxobybfu.supabase.co';
const supabaseKey = 'sb_publishable_RiNMmiLoRH0SFHO-u1i_FQ_JAkGdtQL';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. The function that runs when a button is clicked
async function handleAllergyClick(event) {
    const allergyName = event.target.innerText;
    console.log("Fetching dishes for: " + allergyName);

    // 3. Ask Supabase for the data using your relational schema
    const { data, error } = await supabaseClient
        .from('dish_allergens') 
        .select(`
            dishes (
                dish_name
            ),
            allergens!inner (
                allergen_name
            )
        `)
        .eq('allergens.allergen_name', allergyName);

    // Find the container, clear old results, and make it visible
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; 
    resultsContainer.style.display = 'block';

    if (error) {
        console.error("Error fetching data:", error.message || error);
        resultsContainer.innerText = 'Error fetching data.';
    } else {
        // 4. Format the data nicely for the screen
        const unsafeDishes = data.map(item => item.dishes.dish_name);
        
        if (unsafeDishes.length === 0) {
            resultsContainer.innerText = `No unsafe items found for ${allergyName}.`;
        } else {
            // Create a title
            const title = document.createElement('h5');
            title.innerText = `Cross off or modify the following items for ${allergyName}:`;
            title.style.marginBottom = '10px';
            
            // Create the list
            const list = document.createElement('ul');
            list.style.paddingLeft = '20px';
            
            unsafeDishes.forEach(dish => {
                const listItem = document.createElement('li');
                listItem.innerText = dish;
                list.appendChild(listItem);
            });
            
            // Makes it visible on the screen by appending the title and list to the results container
            resultsContainer.appendChild(title);
            resultsContainer.appendChild(list);
        }
    }
    
    // This makes it scroll down to the results container so the user can see the results immediately
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// 5. Attach the listener to your buttons
const buttons = document.querySelectorAll('.allergy-btn');
buttons.forEach(button => {
    button.addEventListener('click', handleAllergyClick);
});

document.getElementById('year').textContent = new Date().getFullYear();

