'use strict';

function listenforSignUpClick() {
    $('#signup-button').click(event => {
        event.preventDefault;
        location.href = `/signup`;
    })
}

$(function() {
    listenforSignUpClick();
});