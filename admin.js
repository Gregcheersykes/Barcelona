const supabaseUrl = 'https://xhxdtnkphgzyfxobybfu.supabase.co';
const supabaseKey = 'sb_publishable_RiNMmiLoRH0SFHO-u1i_FQ_JAkGdtQL';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Not signed in: go to login
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const email = (user.email || '').toLowerCase();
    const isContractor = email === 'gregdanielsykes@gmail.com';
    const isEmployee = email.endsWith('@barcelonawinebar.com');

    // Signed in with the wrong account: sign out and go to login
    if (!isContractor && !isEmployee) {
        await supabaseClient.auth.signOut();
        alert("Access Denied.");
        window.location.href = 'login.html';
        return;
    }

    // Authorized: show the page
    document.body.style.display = 'flex';

    // ---------- Initial load ----------
    loadDishes();
    loadAllergens();

// ---------- Shared elements and state ----------
const dishInput = document.getElementById('dish-name-input');
const suggestionsContainer = document.getElementById('suggestions-list');
const saveBtn = document.getElementById('save-dish-btn');
const cancelBtn = document.getElementById('cancel-edit-btn');
const formTitle = document.getElementById('form-title');

let allDishes = [];
let editingDishId = null; // null = Add mode, otherwise the id of the dish being edited

// ---------- Allergen checkboxes ----------
// Load allergens and display them with checkboxes and emojis
async function loadAllergens() {
    const response = await supabaseClient
        .from('allergens')
        .select('id, allergen_name');

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
        div.className = 'col-6 col-md-2 mb-2 d-flex align-items-center gap-1';

        const emoji = allergenEmojis[item.allergen_name] || "🍽️";

        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item.id}" id="${item.allergen_name}">
            <span style="margin-right: 5px;">${emoji}</span>
            <label class="form-check-label text-dark" for="${item.allergen_name}">${item.allergen_name}</label>
        `;

        container.appendChild(div);
    }
}

// ---------- Dish table ----------
// Load dishes along with their associated allergens
async function loadDishes() {
    const { data: dishes, error } = await supabaseClient
        .from('dishes')
        .select('id, dish_name, allergens (id, allergen_name)')
        .order('dish_name', { ascending: true });

    if (error) {
        console.error("Error fetching dishes:", error);
        return;
    }

    allDishes = dishes;
    console.log(dishes);

    const container = document.getElementById('dish-list');
    container.innerHTML = '';

    for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        const tr = document.createElement('tr');
        tr.dataset.id = dish.id;

        const allergenNames = dish.allergens && dish.allergens.length > 0
            ? dish.allergens.map(a => a.allergen_name).join(', ')
            : 'None';

        tr.innerHTML = `
            <td>${dish.dish_name}</td>
            <td>${allergenNames}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <button class="btn btn-sm edit-dish-btn" style="background-color: #0d6efd; color: white; margin-bottom: 6px !important;">Edit</button>
                    <button class="btn btn-sm delete-dish-btn" style="background-color: #dc3545; color: white;">Delete</button>
                </div>
            </td>
        `;

        tr.querySelector('.edit-dish-btn').onclick = () => startEdit(dish);
        tr.querySelector('.delete-dish-btn').onclick = () => deleteDish(dish.id, dish.dish_name);

        container.appendChild(tr);
    }
}

// Delete a dish after the user confirms
async function deleteDish(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;

    // .select() returns the deleted rows, so we can tell if a policy silently blocked it
    const { data, error } = await supabaseClient
        .from('dishes')
        .delete()
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error deleting dish:', error);
        alert('Could not delete the dish: ' + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert('Nothing was deleted. Check the DELETE policy on the dishes table.');
        return;
    }

    // If the dish being edited was just deleted, leave edit mode
    if (editingDishId === id) resetForm();

    await loadDishes();
}

// ---------- Live search suggestions ----------
dishInput.addEventListener('input', function () {
    const query = dishInput.value.toLowerCase().trim();
    suggestionsContainer.innerHTML = '';
    if (query.length === 0) return;

    const matches = allDishes.filter(dish => dish.dish_name.toLowerCase().includes(query));

    matches.forEach(match => {
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.innerText = match.dish_name;

        item.onclick = function () {
            dishInput.value = match.dish_name;
            suggestionsContainer.innerHTML = '';
        };
        suggestionsContainer.appendChild(item);
    });
});

// ---------- Edit mode ----------
// Put a dish into the form and switch to edit mode
function startEdit(dish) {
    editingDishId = dish.id;
    dishInput.value = dish.dish_name;
    suggestionsContainer.innerHTML = '';

    const selected = (dish.allergens || []).map(a => String(a.id));
    document.querySelectorAll('#allergen-checkboxes input').forEach(cb => {
        cb.checked = selected.includes(cb.value);
    });

    formTitle.textContent = 'Edit Dish/Item';
    saveBtn.textContent = 'Update';
    cancelBtn.style.display = '';

    
    formTitle.scrollIntoView({ behavior: 'instant', block: 'start' });
    dishInput.focus({ preventScroll: true });
}

// Back to "Add" mode with a clean form
function resetForm() {
    editingDishId = null;
    dishInput.value = '';
    suggestionsContainer.innerHTML = '';
    document.querySelectorAll('#allergen-checkboxes input').forEach(cb => cb.checked = false);
    formTitle.textContent = 'Add New Dish/Item';
    saveBtn.textContent = 'Add Item';
    cancelBtn.style.display = 'none';
}

// Scroll to a row (found by id, so duplicate names can't confuse it) and flash it
function highlightRow(id) {
    const row = document.querySelector(`#dish-list tr[data-id="${id}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });

    row.classList.add('row-flash');
    setTimeout(() => row.classList.remove('row-flash'), 2000);
}


// ---------- Save logic ----------
// Insert a new dish + its allergen links. Returns the new id, or null on failure.
async function addDish(name, allergenIds) {
    const { data: newDish, error: dishError } = await supabaseClient
        .from('dishes')
        .insert({ dish_name: name })
        .select()
        .single();

    if (dishError) {
        console.error('Error adding dish:', dishError);
        alert('Could not add the dish: ' + dishError.message);
        return null;
    }

    if (allergenIds.length > 0) {
        const links = allergenIds.map(allergenId => ({
            dish_id: newDish.id,
            allergen_id: allergenId
        }));

        const { error: linkError } = await supabaseClient.from('dish_allergens').insert(links);

        if (linkError) {
            console.error('Error linking allergens:', linkError);
            await supabaseClient.from('dishes').delete().eq('id', newDish.id); // roll back
            alert('Could not save the allergens: ' + linkError.message);
            return null;
        }
    }
    return newDish.id;
}

// Rename the dish, then add/remove only the allergen links that changed.
// Returns the dish id, or null on failure.
async function updateDish(id, name, newIds) {
    const { data, error } = await supabaseClient
        .from('dishes')
        .update({ dish_name: name })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating dish:', error);
        alert('Could not update the dish: ' + error.message);
        return null;
    }
    if (!data || data.length === 0) {
        alert('Nothing was updated. Check the UPDATE policy on the dishes table.');
        return null;
    }

    const current = allDishes.find(d => d.id === id);
    const oldIds = (current.allergens || []).map(a => String(a.id));
    const toAdd = newIds.filter(x => !oldIds.includes(x));
    const toRemove = oldIds.filter(x => !newIds.includes(x));

    if (toRemove.length > 0) {
        const { data: removed, error: delError } = await supabaseClient
            .from('dish_allergens')
            .delete()
            .eq('dish_id', id)
            .in('allergen_id', toRemove)
            .select();

        if (delError || !removed || removed.length !== toRemove.length) {
            console.error('Error removing allergens:', delError);
            alert('Could not remove some allergens. Check the DELETE policy on dish_allergens.');
            return null;
        }
    }

    if (toAdd.length > 0) {
        const links = toAdd.map(allergenId => ({ dish_id: id, allergen_id: allergenId }));
        const { error: addError } = await supabaseClient.from('dish_allergens').insert(links);

        if (addError) {
            console.error('Error adding allergens:', addError);
            alert('Could not add some allergens: ' + addError.message);
            return null;
        }
    }
    return id;
}

saveBtn.addEventListener('click', async function () {
    const dishName = dishInput.value.trim();
    if (!dishName) {
        alert('Please enter a dish name.');
        return;
    }

    const allergenIds = Array.from(
        document.querySelectorAll('#allergen-checkboxes input:checked')
    ).map(cb => cb.value);

    saveBtn.disabled = true; // prevent double-clicks

    const savedId = editingDishId
        ? await updateDish(editingDishId, dishName, allergenIds)
        : await addDish(dishName, allergenIds);

    saveBtn.disabled = false;
    if (!savedId) return; // error already shown; keep the form as the user left it

    resetForm();
    await loadDishes();
    highlightRow(savedId);
});

cancelBtn.addEventListener('click', resetForm);

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    });
 });