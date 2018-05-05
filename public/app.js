const MOCK_PANTRY_DATA = {
    "pantryItems": [
        {
            "id": "111111",
            "name": "Black beans",
            "quantity": 4,
            "category": "Canned Items",
            "dateAdded": Date.now()
        },
        {
            "id": "222222",
            "name": "Apples",
            "quantity": 2,
            "category": "Fruit",
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
            "category": "Fruit",
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

function getPantryItems(callbackFn) {
    setTimeout(function() { callbackFn(MOCK_PANTRY_DATA)}, 100);
}

function displayPantryItems(data) {
    for (item in data.pantryItems) {
        $('#js-pantry-items').append(`
        <li>${data.pantryItems[item].quantity} ${data.pantryItems[item].name}</li>
        <button>-</button><button>+</button>
        `);
    }

    for(item in data.shoppingListItems) {
        $('#js-shopping-list').append(`<p>${data.shoppingListItems[item].quantity} ${data.shoppingListItems[item].name}`);
    }

    for(recipe in data.recipes) {
        $('#js-recipes').append(`
        <h2>${data.recipes[recipe].title}</h2>
        <img src="${data.recipes[recipe].image}">
        <p>Number of ingredients used from Pantry: ${data.recipes[recipe].usedIngredientCount}</p>
        <p>Number of ingredients missing for this recipe: ${data.recipes[recipe].missedIngredientCount}</p>
        `);
    }
}

function getAndDisplayPantryItems() {
    getPantryItems(displayPantryItems);
}

$(getAndDisplayPantryItems())