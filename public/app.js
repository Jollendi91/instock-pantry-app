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
    ]
};

function getPantryItems(callbackFn) {
    setTimeout(function() { callbackFn(MOCK_PANTRY_DATA)}, 100);
}

function displayPantryItems(data) {
    for (item in data.pantryItems) {
        $('#js-pantry-items').append(`<p>${data.pantryItems[item].quantity} ${data.pantryItems[item].name}</p>`);
    }

    for(item in data.shoppingListItems) {
        $('#js-shopping-list').append(`<p>${data.shoppingListItems[item].quantity} ${data.shoppingListItems[item].name}`);
    }
}

function getAndDisplayPantryItems() {
    getPantryItems(displayPantryItems);
}

$(getAndDisplayPantryItems())