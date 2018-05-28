
function displayRecipes(recipeBox) {
    for(let recipe in recipeBox.recipes) {
        let RECIPE = recipeBox.recipes[recipe];
        $('#js-recipes').append(`
            <article class="js-single-recipe">
                <h3>${RECIPE.title}</h3>
                <img class="js-recipe-img" src="${RECIPE.image}" alt="${RECIPE.title}">
            </article>
        `);  
    }
}

function getRecipes() {
    $.ajax({
        url: '/recipes/recipe-box',
        headers: {
            Authorization: `Bearer ${window.localStorage.token}`
        },
        success: displayRecipes
    });
}

$(function () {
    getRecipes();
});