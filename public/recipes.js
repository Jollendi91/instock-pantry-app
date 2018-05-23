'use strict';

function displayRecipes(recipeData) {

  for (let recipe in recipeData.body) {
    let RECIPE = recipeData.body[recipe];
    $('#js-recipe-list').append(`
            <article id="${RECIPE.id}" class="js-single-recipe">
                <h3>${RECIPE.title}</h3>
                <img class="js-recipe-img" src="${RECIPE.image}" alt="${RECIPE.title}">
                <p>Ingredients used from pantry: <span id="js-exist-ingredients">${RECIPE.usedIngredientCount}</span></p>
                <p>Missing ingredients: <span id="js-missing-ingredients">${RECIPE.missedIngredientCount}</span></p>
                <button id="js-make-recipe-button">Make this!</button>
            </article>
        `);

  }

  $('html, body').animate({
    scrollTop: ($('#js-recipe-list').offset().top)
  }, 700, 'swing');

}

function listenForSearchRecipesClick() {
  $('#js-recipes').on('click', '#js-search-recipes', (event) => {
    $('#js-recipe-list').empty();
      $.ajax('/recipes', {
        beforeSend : function( xhr ) {
          xhr.setRequestHeader( 'Authorization', `Bearer ${window.localStorage.token}`);
      },
        success: displayRecipes
      });
  });
}



function getIngredientList(recipeInfo) {
  for (let ingredient in recipeInfo.body.extendedIngredients) {
    let INGREDIENT = recipeInfo.body.extendedIngredients[ingredient];

    $('#js-ingredient-list').append(`
        <li id="${INGREDIENT.id}">
            <img src="https://spoonacular.com/cdn/ingredients_100x100/${INGREDIENT.image}" alt="${INGREDIENT.name}">
            <p>${INGREDIENT.originalString}</p>
        </li>
        `);
  }
}

function getInstructionList(recipeInfo) {
  for (let instruction in recipeInfo.body.analyzedInstructions[0].steps) {
    let INSTRUCTION = recipeInfo.body.analyzedInstructions[0].steps[instruction];

    $('#js-instruction-list').append(`
      <li id="step-${INSTRUCTION.number}">
        ${INSTRUCTION.step}
      </li>
    `);
  }
}

function displaySingleRecipeDetails(recipeInfo) {
    let RECIPE = recipeInfo.body;
    $('#js-recipe-details').append(`
            <h2>${RECIPE.title}</h2>
            <img src="${RECIPE.image}" alt="${RECIPE.title}">
            <div id="recipe-info">
              <p>From: <a href="${RECIPE.sourceUrl}" target="_blank">${RECIPE.sourceName}</a></p>
              <p>Ready in: ${RECIPE.readyInMinutes} minutes</p>
              <p>Servings: ${RECIPE.servings}</p>
            </div>
            <h3>Ingredients</h3>
            <ul id="js-ingredient-list">
            </ul>
            <h3>Instructions</h3>
            <ol id="js-instruction-list">
            </ol>
        `);
    getIngredientList(recipeInfo);
    getInstructionList(recipeInfo);
    $('html, body').animate({
      scrollTop: ($('#js-recipe-details').offset().top)
    }, 700, 'swing');
  }


function listenForRecipeClick() {
  $('#js-recipes').on('click', '#js-make-recipe-button', function (event) {
    $('#js-recipe-details').empty();
    const recipeID = $(event.currentTarget).parent().attr('id');
    
    $.ajax(`/recipes/${recipeID}`, {success: displaySingleRecipeDetails});
        
  });
}

$(function () {
  listenForSearchRecipesClick();
  listenForRecipeClick();
});