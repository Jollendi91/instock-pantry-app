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
    ]
};

function getPantryItems(callbackFn) {
    setTimeout(function() { callbackFn(MOCK_PANTRY_DATA)}, 100);
}

function displayPantryItems(data) {
    for (item in data.pantryItems) {
        $('body').append(`<p>${data.pantryItems[item].quantity} ${data.pantryItems[item].name}</p>`);
    }
}

function getAndDisplayPantryItems() {
    getPantryItems(displayPantryItems);
}

$(getAndDisplayPantryItems())