'use strict';

const express = require('express');
const unirest = require('unirest');
const router = express.Router();


router.use(express.json());

const {SPOONACULAR_KEY} = require('../config');
const {Pantry, Recipe} = require('../models');
const {jwtAuth} = require('../auth');


router.get('/recipe-box', jwtAuth, (req, res) => {

    Recipe.findOne({user: req.user._id})
        .then(recipeBox => {
            res.json(recipeBox);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

router.get('/recipe-box/:id', jwtAuth, (req, res) => {
    Recipe.findOne({"recipes._id": req.params.id}, {"recipes.$": 1})
        .then(recipe => {
            res.json(recipe);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.post('/' , jwtAuth, (req, res) => {
    const newRecipe = req.body;
       
    Recipe.findOneAndUpdate({
        user: req.user._id,
    },
    {
        $set: {user: req.user._id},
        $push: {recipes: [newRecipe]}
    },
    {
        new: true,
        upsert: true
    })
    .then(recipeBox => {
        res.status(201).json({
            recipeBox: recipeBox,
            newRecipe: newRecipe
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/recipe-box/:id', jwtAuth, (req, res) => {
    Recipe
        .findOneAndUpdate({'recipes._id': req.params.id}, {$pull: {recipes: {_id: req.params.id}}})
        .then(recipes => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal server error"}));
}); 



// Spoonacular API 

router.get('/mashape', jwtAuth, (req, res) => {

    Pantry
        .findOne({user: req.user._id})
        .then(userPantry => {
         let ingredientList = userPantry.items.map((item) => item.name).toString();
         return ingredientList;
        })
        .then(ingredientList => {
            unirest.get('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients')
            .headers({
                "X-Mashape-Key": SPOONACULAR_KEY,
                "Accept": "application/json"
            })
            .query({
                fillIngredients: false,
                ingredients: ingredientList,
                limitLicense: false,
                number: 5,
                ranking: 2
            })
            .end(function(response) {
                res.json(response);
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
}); 

router.post('/mashape', jwtAuth, (req, res) => {

    let ingredientList = req.body.ingredientList.toString();

    unirest.get('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients')
            .headers({
                "X-Mashape-Key": SPOONACULAR_KEY,
                "Accept": "application/json"
            })
            .query({
                fillIngredients: false,
                ingredients: ingredientList,
                limitLicense: false,
                number: 5,
                ranking: 2
            })
            .end(function(response) {
                if (response.error) {
                    console.error(response.error);
                    res.status(500).json({message: 'Internal server error'});
                }
                else {
                    res.json(response);
                }
            });
});

router.get('/mashape/:id', jwtAuth, (req, res) => {

    unirest.get(`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${req.params.id}/information`)
    .headers({
        "X-Mashape-Key": SPOONACULAR_KEY,
        "Accept": "application/json"
    })
    .query({
        includeNutrition: false
    })
    .end(function(response) {
        let savedStatus;

        Recipe
        .findOne({"recipes.title": response.body.title},
        {"recipes.$": 1})
        .then(foundRecipe => {
            if(foundRecipe) {
                savedStatus = "Saved";
            }
            else {
                savedStatus = "Save recipe!"
            }

            res.json({response, savedStatus});
        });
    });
});

module.exports = {router};