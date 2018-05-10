'use strict';

function addNewItem(itemName, quantity, category) {
    $.ajax('/pantry-items', {
        method: 'POST',
        data: JSON.stringify({
            name: itemName,
            quantity: quantity,
            category: category
        }),
        contentType: 'application/json',
        success: alertItemStatus
    });
}

function alertItemStatus(data) { 
    if (data.message) {
        $('#js-alert').append(`<h2>${data.message}</h2>`); 
    }
    else {
        $('#js-alert').append(`<h2>${data.name} has been added!</h2>`);
        getPantryItems();
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
        $('#js-alert').empty();
        addNewItem(newItem, quantity, category);
    });
}

function getExistingCategories(data) {
    const categories = [];
    for (let item in data.pantryItems) {
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

    for (let category in displayedCategories) {

        $('#js-pantry-items').append(`
            <h3>${displayedCategories[category]}</h3>
            <ul id="${displayedCategories[category]}">
            </ul>
        `);
    }
}

function getPantryItems() {
    $.ajax('/pantry-items', {success: getAndDisplayCategoriesAndItems});
}

function displayPantryItems(data) {
    for (let item in data.pantryItems) {
        const selector = `#${data.pantryItems[item].category}`;
        $(selector).append(`
        <li id="${data.pantryItems[item].id}"><span class="js-quantity">${data.pantryItems[item].quantity}</span> - <span class="js-item-name">${data.pantryItems[item].name}</span> 
        <button id="js-subtract" class="increment">-</button><button id="js-add" class="increment">+</button></li>
        `);
    }
}

function getAndDisplayCategoriesAndItems(PANTRY_DATA) {
    $('#js-pantry-items').empty();
    displayCategories(PANTRY_DATA);
    displayPantryItems(PANTRY_DATA);
}

function updateItemInDatabase(itemId, itemQuantity) {
    $.ajax(`/pantry-items/${itemId}`, {
        method: 'PUT',
        data: JSON.stringify({
            id: itemId,
            quantity: itemQuantity
        }),
        contentType: 'application/json',
    });
}

function listenForIncrementItemClick() {
    $('#js-pantry-items').on('click', '.increment', function(event) {
        event.preventDefault();
        const currentItemId = $(event.currentTarget).closest('li').attr('id');
    
        if(event.currentTarget.id === 'js-add') {
           let itemQuantity = $(event.currentTarget).parent().children('.js-quantity').text();
            itemQuantity++;
            updateItemInDatabase(currentItemId, itemQuantity);
           getPantryItems();
        }
        else if (event.currentTarget.id === 'js-subtract') {
            currentItem.quantity--;
            if(currentItem.quantity === 0) {
                const itemIndex = MOCK_PANTRY_DATA.pantryItems.indexOf(currentItem);
                if (itemIndex != -1) {
                    MOCK_PANTRY_DATA.pantryItems.splice(itemIndex, 1);
                }
            }
            getPantryItems();
        }
    });
}

$(function () {
    getPantryItems();
    listenforAddNewItem();
    listenForIncrementItemClick();
    });