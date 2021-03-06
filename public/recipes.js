'use strict';

function displayRecipes(recipeData) {

  for (let recipe in recipeData.body) {
    let RECIPE = recipeData.body[recipe];
    $('#js-recipe-list').append(`
            <article id="${RECIPE.id}" class="js-single-recipe">
                <h3>${RECIPE.title}</h3>
                <img class="js-recipe-img" src="${RECIPE.image}" alt="${RECIPE.title}">
                <div class="ingredients-used-info">
                  <p>Ingredients used from pantry: <span id="js-exist-ingredients">${RECIPE.usedIngredientCount}</span></p>
                  <p>Missing ingredients: <span id="js-missing-ingredients">${RECIPE.missedIngredientCount}</span></p>
                </div>
            </article>
        `);

  }

  $('html, body').animate({
    scrollTop: ($('#js-recipes').offset().top - 60)
  }, 700, 'swing');

}

let custom = false;

// User can select ingredients they would like to use in search
function listenForCustomSearchClick() {
  $('#recipe-search').on('click', '#js-custom-recipe-search', () => {
    if (custom) {
      $('input[type="checkbox"]').css('display', 'none');
      $('#js-search-recipes').text("Search All");
      $('#js-custom-recipe-search').text("Choose Ingredients");
      $('#js-custom-search-status').css('display', 'none');
      custom = false;
    } else {
      $('input[type="checkbox"]').css('display', 'block');
      $('#js-search-recipes').text("Search Custom");
      $('#js-custom-recipe-search').text("All Ingredients");
      $('#js-custom-search-status').css('display', 'block');
      $('html, body').animate({
        scrollTop: ($('#js-custom-search-status').offset().top - 60)
      }, 700, 'swing');
      custom = true;
    }
  });
}

function listenForSearchRecipesClick() {
  $('#recipe-search').on('click', '#js-search-recipes', () => {
    $('#js-recipe-list').empty();

    if (custom) {
      let ingredientList = [];

      $("input:checked").each(function (index, ingredient) {
        ingredientList.push(ingredient.value);
      });

      $.ajax({
        url: '/recipes/mashape',
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.token}`
        },
        data: JSON.stringify({
          ingredientList
        }),
        success: displayRecipes
      });
    } else {
      $.ajax('/recipes/mashape', {
        headers: {
          Authorization: `Bearer ${window.localStorage.token}`
        },
        success: displayRecipes
      });
    };

  });
}



function getIngredientList(recipeInfo) {
  for (let ingredient in recipeInfo.response.body.extendedIngredients) {
    let INGREDIENT = recipeInfo.response.body.extendedIngredients[ingredient];

    $('#js-ingredient-list').append(`
        <li id="${INGREDIENT.id}">
          <div>
            <img src="https://spoonacular.com/cdn/ingredients_100x100/${INGREDIENT.image}" alt="${INGREDIENT.name}">
          </div>
          <p>${INGREDIENT.originalString}</p>
        </li>
        `);
  }
}

function getInstructionList(recipeInfo) {
  for (let instruction in recipeInfo.response.body.analyzedInstructions[0].steps) {
    let INSTRUCTION = recipeInfo.response.body.analyzedInstructions[0].steps[instruction];

    $('#js-instruction-list').append(`
      <li id="step-${INSTRUCTION.number}">
        ${INSTRUCTION.step}
      </li>
    `);
  }
}

let currentRecipe;

function displaySingleRecipeDetails(recipeInfo) {
  let RECIPE = recipeInfo.response.body;

  currentRecipe = {
    title: RECIPE.title,
    image: RECIPE.image,
    source: RECIPE.sourceUrl,
    sourceName: RECIPE.sourceName,
    timeReady: RECIPE.readyInMinutes,
    servings: RECIPE.servings,
    ingredients: RECIPE.extendedIngredients,
    instructions: RECIPE.analyzedInstructions
  };

  $('#js-recipe-details').append(`
      <div id="recipe-header">
        <h2>${RECIPE.title}</h2>
        <img src="${RECIPE.image}" alt="${RECIPE.title}">
        <div id="recipe-info">
          <p>From: <a href="${RECIPE.sourceUrl}" target="_blank">${RECIPE.sourceName}</a></p>
          <p>Ready in: ${RECIPE.readyInMinutes} minutes</p>
          <p>Servings: ${RECIPE.servings}</p>
        </div>
        <div id="recipe-saved">
          <div id="js-recipe-saved-status"></div>
          <button id="js-save-recipe">${recipeInfo.savedStatus}</button>
        </div>
      </div>
      <section class="list-container">
        <h3>Ingredients</h3>
        <ul id="js-ingredient-list" class="list">
        </ul>
      </section>
      <section class="list-container">
        <h3>Instructions</h3>
        <ol id="js-instruction-list" class="list">
        </ol>
      <section>
        `);
  getIngredientList(recipeInfo);
  getInstructionList(recipeInfo);

  if (recipeInfo.savedStatus === "Saved") {
    $('#js-save-recipe').prop('disabled', true)
      .css('cursor', 'default');
  } else {
    $('#js-save-recipe').prop('disabled', false)
      .css('cursor', 'pointer');
  }

  $('html, body').animate({
    scrollTop: ($('#js-recipe-details').offset().top - 60)
  }, 700, 'swing');
  
};

function alertRecipeSaved() {
  $('#js-save-recipe').text('Added').prop('disabled', true).css('cursor', 'default');
  $('#js-recipe-saved-status').html(`<p>This recipe has been added to your recipe box!</p>`);
}

function listenForSaveRecipe() {
  $('#js-recipes').on('click', '#js-save-recipe', function () {
    $.ajax({
      url: '/recipes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.token}`
      },
      data: JSON.stringify(currentRecipe),
      success: alertRecipeSaved,
    });
  });
}

function listenForRecipeClick() {
  $('#js-recipes').on('click', '.js-single-recipe', function (event) {
    $('#js-recipe-details').empty();

    const recipeID = $(event.currentTarget).attr('id');

    $.ajax(`/recipes/mashape/${recipeID}`, {
      headers: {
        Authorization: `Bearer ${window.localStorage.token}`
      },
      success: displaySingleRecipeDetails
    });

  });
}

$(function () {
  listenForCustomSearchClick();
  listenForSearchRecipesClick();
  listenForRecipeClick();
  listenForSaveRecipe();
});