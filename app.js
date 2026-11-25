// 1. Connect to your Supabase Database
const supabaseUrl = 'https://xhxdtnkphgzyfxobybfu.supabase.co';
const supabaseKey = 'sb_publishable_RiNMmiLoRH0SFHO-u1i_FQ_JAkGdtQL';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. The function that runs when a button is clicked
async function handleAllergyClick(event) {
    const buttonText = event.target.innerText;
    
    // Define what each button should actually search for in the database
    let searchAllergens = [buttonText]; // Default: just search the button name
    
    if (buttonText === 'Vegetarian') {
        searchAllergens = ['Meat'];
    } else if (buttonText === 'Vegan') {
        searchAllergens = ['Meat', 'Dairy', 'Egg', 'Seafood', 'Shellfish', 'Honey'];
    }
    
    console.log("Fetching dishes for: " + buttonText);

    // 3. Ask Supabase for the data (using .in() to search multiple allergens at once)
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
        .in('allergens.allergen_name', searchAllergens);

    // Find the container, clear old results, and make it visible
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; 
    resultsContainer.style.display = 'block';

    if (error) {
        console.error("Error fetching data:", error.message || error);
        resultsContainer.innerText = 'Error fetching data.';
    } else {
        // 4. Format the data nicely for the screen (Remove duplicates using Set)
        const unsafeDishes = [...new Set(data.map(item => item.dishes.dish_name))];
        
        if (unsafeDishes.length === 0) {
            resultsContainer.innerText = `No unsafe items found for ${buttonText}.`;
        } else {
            // Create a title
            const title = document.createElement('h5');
            title.innerText = `Cross off or modify the following items for ${buttonText}:`;
            title.style.marginBottom = '10px';
            
            // Create the list
            const list = document.createElement('ul');
            list.style.paddingLeft = '20px';
            
            unsafeDishes.forEach(dish => {
                const listItem = document.createElement('li');
                listItem.innerText = dish;
                list.appendChild(listItem);
            });
            
            resultsContainer.appendChild(title);
            resultsContainer.appendChild(list);
        }
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// 5. Attach the listener to your buttons
const buttons = document.querySelectorAll('.allergy-btn');
buttons.forEach(button => {
    button.addEventListener('click', handleAllergyClick);
});

document.getElementById('year').textContent = new Date().getFullYear();