'use strict';

function addNewItem(itemName, quantity, category) {
    $.ajax('/pantry-items', {
        beforeSend : function( xhr ) {
            xhr.setRequestHeader( 'Authorization', `Bearer ${window.localStorage.token}`);
        },
        method: 'POST',
        data: JSON.stringify({
            name: itemName,
            quantity: quantity,
            category: category
        }),
        contentType: 'application/json',
        success: alertItemAdded,
        error: alertItemExists
    });
}

function alertItemExists(err) {
    $('#js-alert').append(`<h2>This item already exists!</h2>`);
}

function alertItemAdded(data) { 
    
     $('#js-alert').append(`<h2>${data.newItem.name} has been added!</h2>`);
    getPantryItems();

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
    for (let item in data.items) {
        const currentCategory = data.items[item].category;
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
            <ul id="${displayedCategories[category]}">
                <h3>${displayedCategories[category]}</h3>
            </ul>
        `);
    }
}

function getPantryItems() {
    $.ajax('/pantry-items', {
        beforeSend : function( xhr ) {
            xhr.setRequestHeader( 'Authorization', `Bearer ${window.localStorage.token}`);
        },
        success: getAndDisplayCategoriesAndItems,
        error: function(err) { 
            window.location.href = '/';
        }
    });
}

function displayPantryItems(data) {

    for (let item in data.items) {
        const selector = `#${data.items[item].category}`;
        $(selector).append(`
        <li id="${data.items[item]._id}"><span class="js-quantity">${data.items[item].quantity}</span> - <span class="js-item-name">${data.items[item].name}</span> 
        <button id="js-subtract" class="increment">-</button><button id="js-add" class="increment">+</button></li>
        `);
    }

    if (data.items[0]) {
        $('#js-recipes').html(`
        <h2>Find recipes that use items from your pantry!</h2>
        <button id="js-search-recipes">Search Recipes</button>
        <section id="js-recipe-list">
        </section>
        <section id="js-recipe-details">
        </section>`);
    }
    else {
        $('#js-recipes').empty();
    }
}

function getAndDisplayCategoriesAndItems(PANTRY_DATA) {
    $('#js-pantry-items').empty();
    $('body').css('display', 'block');
    displayCategories(PANTRY_DATA);
    displayPantryItems(PANTRY_DATA);
}

function updateItemInDatabase(itemId, itemQuantity) {
    $.ajax({
        url: `/pantry-items/${itemId}`,
        method: 'PUT',
        data: JSON.stringify({
            id: itemId,
            quantity: itemQuantity
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.localStorage.token}`
        }
    });
}

function deleteItemInDatabase(itemId) {
    $.ajax({
        url: `/pantry-items/${itemId}`, 
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${window.localStorage.token}`
        }
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
            let itemQuantity = $(event.currentTarget).parent().children('.js-quantity').text();
            itemQuantity--;

            if (itemQuantity === 0) {
                deleteItemInDatabase(currentItemId);
            }
            else{
               updateItemInDatabase(currentItemId, itemQuantity);
            }
            getPantryItems();
        }
    });
}

function listenForUserLogOut() {
    $('#js-user-logout').click(event => {
        event.preventDefault();
        $.ajax({
            url: '/instock/auth/logout',
            headers: {
                Authorization: `Bearer ${window.localStorage.token}`
            },
            success: function(data) {
                localStorage.clear();
                window.location.href = data.redirect;        
            }});
    });
}

$(function () {
    getPantryItems();
    listenforAddNewItem();
    listenForIncrementItemClick();
    listenForUserLogOut();
    });