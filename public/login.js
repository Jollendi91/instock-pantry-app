'use strict';

function displayError(err) {
    const error = err.responseJSON;
    console.log(err);
    $('#js-login-status').html(`
        <h2>${error.reason}</h2>
        <p>${error.message}</p>
    `);
}

function goToUserPantry(data) {
    window.localStorage.token = data.authToken;
   window.location.href = '/pantry.html';
}

function sendUserLoginData(_username, _password) {
    $.ajax('/instock/auth/login', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            username: _username,
            password: _password
        }),
        error: displayError,
        success: goToUserPantry
    });
}

function listenForLoginClick() {
    $('#js-login-form').submit(event => {
        event.preventDefault();
        const username = $('#js-login-username').val();
        const password = $('#js-login-password').val();

        $('#js-login-form').each(function() {
            this.reset();
        });

        sendUserLoginData(username, password);
    });
}

function listenforSignUpClick() {
    $('#signup-button').click(event => {
        event.preventDefault;
        location.href = `/signup.html`;
    })
}

$(function() {
    listenforSignUpClick();
    listenForLoginClick();
});