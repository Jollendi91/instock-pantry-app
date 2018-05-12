const express = require('express');
const unirest = require('unirest');
const router = express.Router();


router.use(express.json());

const {Pantry} = require('../models');


router.get('/', (req, res) => {
    Pantry
        .find()
        .then(pantryItems => {
         let ingredientList = pantryItems.map((item) => item.name).toString();
         return ingredientList;
        })
        .then(ingredientList => {
            unirest.get('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients')
            .headers({
                "X-Mashape-Key": "zg5hoQFND2mshRWVxJwHg4AC71z7p1MueSnjsncnpsbAVkLerP",
                "Accept": "application/json"
            })
            .query({
                fillIngredients: false,
                ingredients: ingredientList,
                limitLicense: false,
                number: 5,
                ranking: 1
            }).end(function(response) {
                res.json(response);
            })
            
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
}); 

module.exports = router;