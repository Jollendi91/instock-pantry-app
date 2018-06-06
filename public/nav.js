'use strict';

function listenForNavToggleClick() {
    $('.nav-toggle').click( () => {
        $('.nav-item').toggleClass('navbar-toggle-show');
        $('nav').toggleClass('nav-toggle-width');

    });
}

function listenForPantryNavClick() {
    $('#js-pantry').click(() => {
        window.location.href = '/pantry.html';
    });
}

function listenForRecipeNavClick() {
    $('#js-recipe-box').click(() => {
        window.location.href = '/recipes.html';
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
    listenForNavToggleClick();
    listenForPantryNavClick();
    listenForRecipeNavClick();
    listenForUserLogOut();
});