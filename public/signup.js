'use strict';

function displayError(error) {
    const ERROR = error.responseJSON;
    $('#js-signup-status').html(`
        <h2>${ERROR.reason}</h2>
        <p>${ERROR.message}</p>
        <p>Error location: ${ERROR.location}</p>
    `);
}

function displaySuccess(data) {
    console.log(data);
    $('#js-signup').html(`
    <h2>User successfully registered!</h2>
    <p>Please proceed to Login</p>
    <button id="js-login-button">Login</button>`);
}

function sendRegisterUserData(_username, _password, _firstName, _lastName) {
    $.ajax('/instock/users/', {
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            username: _username,
            password: _password,
            firstName: _firstName,
            lastName: _lastName
        }),
        error: displayError,
        success: displaySuccess
    });
}

function listenForLoginClick() {
    $('#js-signup').on('click', '#js-login-button', event => {
        event.preventDefault();
        location.href = "..";
    });
}

function listenForSignupSubmit() {
    $('#js-signup-form').submit(event => {
        event.preventDefault();
        const username = $('#js-signup-username').val();
        const password = $('#js-signup-password').val();
        const firstName = $('#js-signup-firstName').val();
        const lastName = $('#js-signup-lastName').val();

        sendRegisterUserData(username, password, firstName, lastName);
        });  
    }


$(function() {
    listenForSignupSubmit();
    listenForLoginClick();
});