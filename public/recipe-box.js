
function displayRecipes(recipeBox) {

    $('body').css('display', 'block');

    $('#js-recipes').empty();

    for(let recipe in recipeBox.recipes) {
        let RECIPE = recipeBox.recipes[recipe];
        $('#js-recipes').append(`
        <article>
            <div id="${RECIPE._id}" class="js-single-recipe">
                <h3>${RECIPE.title}</h3>
                <img class="js-recipe-img" src="${RECIPE.image}" alt="${RECIPE.title}">
            </div>
            <button id="js-recipe-delete"><i class="fas fa-times"></i></button>
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
        success: displayRecipes,
        error: function(err) {
            window.location.href = '/';
        }
    });
}

function getIngredientList(recipeInfo) {
    for (let ingredient in recipeInfo.recipes[0].ingredients) {
      let INGREDIENT = recipeInfo.recipes[0].ingredients[ingredient];
  
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
    for (let instruction in recipeInfo.recipes[0].instructions[0].steps) {
      let INSTRUCTION = recipeInfo.recipes[0].instructions[0].steps[instruction];
  
      $('#js-instruction-list').append(`
        <li id="step-${INSTRUCTION.number}">
          ${INSTRUCTION.step}
        </li>
      `);
    }
  }

function displaySingleRecipeDetails(recipeInfo) {
    let RECIPE = recipeInfo.recipes[0];

    $('#js-recipe-details').append(`
        <div id="recipe-header">
            <h2>${RECIPE.title}</h2>
            <img src="${RECIPE.image}" alt="${RECIPE.title}">
            <div id="recipe-info">
              <p>From: <a href="${RECIPE.sourceUrl}" target="_blank">${RECIPE.sourceName}</a></p>
              <p>Ready in: ${RECIPE.timeReady} minutes</p>
              <p>Servings: ${RECIPE.servings}</p>
            </div>
        </div>
        <ul id="js-ingredient-list" class="list">
            <h3>Ingredients</h3>
        </ul>
        <ol id="js-instruction-list" class="list">
            <h3>Instructions</h3>
        </ol>
        `);
    getIngredientList(recipeInfo);
    getInstructionList(recipeInfo);

    $('html, body').animate({
      scrollTop: ($('#js-recipe-details').offset().top - 60)
    }, 700, 'swing');
  };

function listenForRecipeDeleteClick() {
    $('#js-recipes').on('click', '#js-recipe-delete', function(event) {
        $('#js-recipe-details').empty();
        $('#js-recipes').empty();
       const recipeId = $(event.currentTarget).siblings('div').attr('id');
        
       $.ajax({
           url: `recipes/recipe-box/${recipeId}`,
           method: 'DELETE',
           headers: {
               Authorization: `Bearer ${window.localStorage.token}`
           },
           success: getRecipes
       });

    });
}


function listenForRecipeClick() {
    $('#js-recipes').on('click', '.js-single-recipe', function (event) {
        $('#js-recipe-details').empty();
        
        const recipeID = $(event.currentTarget).attr('id');
        
        $.ajax({
            url: `/recipes/recipe-box/${recipeID}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.token}`
          },
          success: displaySingleRecipeDetails
        });
            
      });
}

$(function () {
    listenForRecipeDeleteClick();
    listenForRecipeClick();
    getRecipes();
});