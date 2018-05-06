const MOCK_PANTRY_DATA = {
    "pantryItems": [
        {
            "id": "111111",
            "name": "Black beans",
            "quantity": 4,
            "category": "Canned",
            "dateAdded": Date.now()
        },
        {
            "id": "222222",
            "name": "Apples",
            "quantity": 2,
            "category": "Fruits",
            "dateAdded": Date.now()
        },
        {
            "id": "333333",
            "name": "Cucumber",
            "quantity": 1,
            "category": "Vegetables",
            "dateAdded": Date.now()
        },
        {
            "id": "444444",
            "name": "Blueberries",
            "quantity": 1,
            "category": "Fruits",
            "dateAdded": Date.now()
        },
        {
            "id": "555555",
            "name": "2% Milk",
            "quantity": 1,
            "category": "Dairy",
            "dateAdded": Date.now()
        }
    ],
    "shoppingListItems": [
        {
            "id": "666666",
            "name": "French Bread",
            "quantity": 2,
            "category": "Bread"
        },
        {
            "id": "777777",
            "name": "Broccoli",
            "quantity": 1,
            "category": "Vegetables"
        },
        {
            "id": "888888",
            "name": "Chips",
            "quantity": 3,
            "category": "Snacks"
        },
        {
            "id": "999999",
            "name": "Cereal",
            "quantity": 2,
            "category": "Breakfast"
        },
    ],
    "recipes": [
        {
            "id": "101010",
            "title": "Easy & Delish! ~ Apple Crumble",
            "image": "https://spoonacular.com/recipeImages/Easy---Delish--Apple-Crumble-641803.jpg",
            "usedIngredientCount": 3,
            "missedIngredientCount": 4,
        },
        {
            "id": "121212",
            "title": "Grandma's Apple Crisp",
            "image": "https://spoonacular.com/recipeImages/Grandmas-Apple-Crisp-645152.jpg",
            "usedIngredientCount": 3,
            "missedIngredientCount": 6
        },
        {
            "id": "131313",
            "title": "Quick Apple Ginger Pie",
            "image": "https://spoonacular.com/recipeImages/Quick-Apple-Ginger-Pie-657563.jpg",
            "usedIngredientCount": 3,
            "missedIngredientCount": 6
        },
        {
            "id": "141414",
            "title": "Cinnamon Sugar Fried Apples",
            "image": "https://spoonacular.com/recipeImages/Cinnamon-Sugar-Fried-Apples-639487.jpg",
            "usedIngredientCount": 3,
            "missedIngredientCount": 8
        }
    ]
};

let ITEM_ID = 111112;

function addNewItem(itemName, quantity, category) {
    const newItem = {
        "id": `${ITEM_ID++}`,
        "name": itemName,
        "quantity": quantity,
        "category": category,
        "addedDate": Date.now()
    }

    MOCK_PANTRY_DATA.pantryItems.push(newItem);
}

function searchDatabaseForExistingItem(newItem, quantity, category) {
    const existingItem = MOCK_PANTRY_DATA.pantryItems.find(item => {
        return item.name.toLowerCase() === newItem.toLowerCase()
    });
    const similarItem = MOCK_PANTRY_DATA.pantryItems.find(item => {
        return item.name.toLowerCase().includes(newItem.toLowerCase());
    });

    $('#js-alert').empty();
    if (existingItem) {
        $('#js-alert').append(`<h2>${newItem} already exists!</h2>`);
    }
    else if (similarItem) {
        $('#js-alert').append(`<h2>${newItem} is similiar to ${similarItem.name}, which is already in your pantry. Is this what you meant?</h2>`);
    }
    else {
        addNewItem(newItem, quantity, category);
    }
}

function listenforAddNewItem() {
    $('#js-add-item').submit(event => {
        event.preventDefault();
        let newItem = $('#js-item-name').val();
        let quantity = parseInt($('#js-quantity').val());
        let category = $('#js-category').val();
        $('#js-item-name').val("");
        $('#js-quantity').val(1);
        $('#js-category').val("");
        searchDatabaseForExistingItem(newItem, quantity, category);
        getAndDisplayCategoriesAndItems();
    });
}

function getExistingCategories(data) {
    const categories = [];
    for (item in data.pantryItems) {
        const currentCategory = data.pantryItems[item].category;
        const existingCategory = categories.find(item => {
            return item === currentCategory;
        });
        if (!(existingCategory)) {
            categories.push(currentCategory);
        }
    }
    return categories;
}

function displayCategories(data) {
    const displayedCategories = getExistingCategories(data);

    for (category in displayedCategories) {

        $('#js-pantry-items').append(`
            <h3>${displayedCategories[category]}</h3>
            <ul id="${displayedCategories[category]}">
            </ul>
        `);
    }
}

function getPantryItems(callbackFn) {
    setTimeout(function () { callbackFn(MOCK_PANTRY_DATA) }, 100);
}

function displayPantryItems(data) {
    for (item in data.pantryItems) {
        const selector = `#${data.pantryItems[item].category}`;
        $(selector).append(`
        <li id="${data.pantryItems[item].id}">${data.pantryItems[item].quantity} - ${data.pantryItems[item].name} <button id="js-subtract" class="increment">-</button><button id="js-add" class="increment">+</button></li>
        `);
    }
}

function getAndDisplayCategoriesAndItems() {
    $('#js-pantry-items').empty();
    displayCategories(MOCK_PANTRY_DATA);
    getPantryItems(displayPantryItems);
}

function listenForIncrementItemClick() {
    $('#js-pantry-items').on('click', '.increment', function(event) {
        event.preventDefault();
        const currentItemId = $(event.currentTarget).closest('li').attr('id');
        const currentItem = MOCK_PANTRY_DATA.pantryItems.find(item => {
                return item.id === currentItemId;
            });

        if(event.currentTarget.id === 'js-add') {
           currentItem.quantity++;
           getAndDisplayCategoriesAndItems();
        }
        else if (event.currentTarget.id === 'js-subtract') {
            currentItem.quantity--;
            if(currentItem.quantity === 0) {
                const itemIndex = MOCK_PANTRY_DATA.pantryItems.indexOf(currentItem);
                if (itemIndex != -1) {
                    MOCK_PANTRY_DATA.pantryItems.splice(itemIndex, 1);
                }
            }
            getAndDisplayCategoriesAndItems();
        }
    });
}

$(function () {
    getAndDisplayCategoriesAndItems();
    listenforAddNewItem();
    listenForIncrementItemClick();
});


/*for(item in data.shoppingListItems) {
        $('#js-shopping-list').append(`<p>${data.shoppingListItems[item].quantity} ${data.shoppingListItems[item].name}`);
    }

    for(recipe in data.recipes) {
        $('#js-recipes').append(`
        <h2>${data.recipes[recipe].title}</h2>
        <img src="${data.recipes[recipe].image}">
        <p>Number of ingredients used from Pantry: ${data.recipes[recipe].usedIngredientCount}</p>
        <p>Number of ingredients missing for this recipe: ${data.recipes[recipe].missedIngredientCount}</p>
        `);
    }*/