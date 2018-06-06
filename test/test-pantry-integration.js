'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const {Pantry, User, Recipe} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');


chai.use(chaiHttp);

let testUser = {
    username: faker.internet.userName(),
    password: faker.internet.password()
}

testUser.verifyPassword = testUser.password;

function addUser() {
    console.info('registering test user');
   return chai.request('http://localhost:8080')
    .post('/instock/users/')
    .send(testUser)
    .then(function(res) {
        console.info('authenticating test user');
        testUser._id = res.body._id;
        return chai.request('http://localhost:8080')
            .post('/instock/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                username: testUser.username,
                password: testUser.password
            })
    })
    .then(function(res) {
        testUser.authToken = res.body.authToken;
       return seedPantryData();
    })
    .catch(error => console.log(error));
}

/* Pantry Test Functions */

function seedPantryData() {
    console.info('seeding pantry data');
    const seedData = [];

    seedData.push(generatePantryData());

    return Pantry.insertMany(seedData);
}

function generateCategoryName() {
    const categories = [
        'Bread', 'Condiments', 'Canned', 'Dairy', 'Dry/Baking', 'Frozen', 'Fruits', 'Meats', 'Snacks', 'Spices/Seasonings', 'Vegetables', 'Miscellaneous'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

function seedItemData() {
    console.info('seeding item data');
    const itemData = [];

    for (let i=1; i<=10; i++) {
        itemData.push(generateItemData());
    }

    return itemData;
}

function generateItemData() {
    return {
        name: faker.commerce.productName(),
        quantity: faker.random.number(),
        category: generateCategoryName()
    }
}

function generatePantryData() {
    return {
        user: testUser._id,
        items: seedItemData()
    };
}

/* Recipe Test Functions */

function addRecipeUser() {
    console.info('registering test user');
   return chai.request('http://localhost:8080')
    .post('/instock/users/')
    .send(testUser)
    .then(function(res) {
        console.info('authenticating test user');
        testUser._id = res.body._id;
        return chai.request('http://localhost:8080')
            .post('/instock/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                username: testUser.username,
                password: testUser.password
            })
    })
    .then(function(res) {
        testUser.authToken = res.body.authToken;
       return seedRecipeBoxData();
    })
    .catch(error => console.log(error));
}

function seedRecipeBoxData() {
    console.info('seeding recipe box data');
    const recipeBoxData = [];

    recipeBoxData.push(generateRecipeBoxData());

    return Recipe.insertMany(recipeBoxData);
}

function seedRecipeData() {
    console.info('seeding recipe data');
    const recipeData = [];

    for (let i=1; i<=10; i++) {
        recipeData.push(generateRecipeData());
    }

    return recipeData;
}

function generateRecipeData() {
    return {
        title: faker.lorem.sentence(),
        image: faker.image.imageUrl(),
        source: faker.internet.url(),
        sourceName: faker.company.companyName(),
        timeReady: faker.random.number(),
        servings: faker.random.number(),
        ingredients: generateIngredientData(),
        instructions: generateInstructionData()
    }
}

function generateIngredientData() {
    const ingredientData = [];

    for (let i=1; i<=10; i++) {
        ingredientData.push(faker.random.word);
    }

    return ingredientData;
}

function generateInstructionData() {
    const instructionData = [];

    for (let i=1; i<=10; i++) {
        instructionData.push(faker.random.sentence);
    }

    return instructionData;
}

function generateRecipeBoxData() {
    return {
        user: testUser._id,
        recipes: seedRecipeData()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Pantry API resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return addUser();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });
    
    describe('GET endpoint', function() {

        it('should get all pantry items', function() {
            let res;
            return chai.request(app)
                .get('/pantry-items')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.items).to.have.length.of.at.least(1);

                    return Pantry.aggregate([
                        {
                            $match: {user: ObjectId(_res.body.user)}
                         }, 
                         {
                             $project: { numberOfItems: {$size: "$items"}}
                         }]);
                })
                .then(function(count) {
                    expect(res.body.items).to.have.lengthOf(count[0].numberOfItems);
                });
        });

        it('should return a single item if passed id', function() {
            let pantryItem;
            
            return Pantry.findOne()
                .then(function(_pantryItem) {
                    pantryItem = _pantryItem.items[0];
                    return chai.request(app)
                        .get(`/pantry-items/${_pantryItem.items[0]._id}`)
                })
                .then(function(res) {
                    const resItem = res.body[0].items[0];
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(resItem).to.be.an('object');
                    expect(resItem.name).to.equal(pantryItem.name);
                    expect(resItem.quantity).to.equal(pantryItem.quantity);
                    expect(resItem.category).to.equal(pantryItem.category);
                });
        });

        it('should return pantry items with right fields', function() {
            let resPantryItem;

            return chai.request(app)
                .get('/pantry-items')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.items).to.be.an('array');
                    expect(res.body.items).to.have.lengthOf.at.least(1);

                    res.body.items.forEach(function(item) {
                        expect(item).to.be.an('object');
                        expect(item).to.include.keys('_id', 'name', 'quantity', 'category');
                    });

                    resPantryItem = res.body.items[0];
                    return Pantry.findOne({user: ObjectId(res.body.user)});
                })
                .then(function(pantryItem) {
                    const item = pantryItem.items[0];
                    expect(resPantryItem._id).to.equal(item._id.toString());
                    expect(resPantryItem.name).to.equal(item.name);
                    expect(resPantryItem.quantity).to.equal(item.quantity);
                    expect(resPantryItem.category).to.equal(item.category);
                });
        });
    });

    describe('POST endpoint', function() {

        it('should add a new pantry item', function() {

            const newPantryItem = generateItemData();

            return chai.request(app)
                .post('/pantry-items')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .send(newPantryItem)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    
                    const index = res.body.pantry.items.length - 1;
                    const newItemIndex = res.body.pantry.items[index];
                    expect(newItemIndex).to.include.keys('_id', 'name', 'quantity', 'category');
                    expect(newItemIndex.name).to.equal(newPantryItem.name);
                    expect(newItemIndex.id).to.not.be.null;
                    expect(newItemIndex.quantity).to.equal(newPantryItem.quantity);
                    expect(newItemIndex.category).to.equal(newPantryItem.category);

                    return Pantry.findOne({user: ObjectId(res.body.pantry.user)});
                })
                .then(function(pantryItem) {
                    const index = pantryItem.items.length - 1;
                    expect(pantryItem.items[index].name).to.equal(newPantryItem.name);
                    expect(pantryItem.items[index].quantity).to.equal(newPantryItem.quantity);
                    expect(pantryItem.items[index].category).to.equal(newPantryItem.category);
                });
        });
    });

    describe('PUT endpoint', function() {

        it('should update fields sent over', function() {
            const updateData = {
                quantity: 15
            };

            return Pantry
                .findOne()
                .then(function(pantryItem) {
                    
                    updateData.id = pantryItem.items[0]._id;
                    return chai.request(app)
                        .put(`/pantry-items/${pantryItem.items[0]._id}`)
                        .set('Authorization', `Bearer ${testUser.authToken}`)
                        .send(updateData)
                        .then(function(res) {
                            expect(res).to.have.status(204);

                            return Pantry.findOne({'items._id': updateData.id});
                        })
                        .then(function(pantryItem) {
                            expect(pantryItem.items[0].quantity).to.equal(updateData.quantity);
                        });
                });
        });
    });

   describe('DELETE endpoint', function() {

        it('should remove the requested item', function() {
            let pantryItem;
            return Pantry
                .findOne()
                .then(function(_pantryItem) {
                    pantryItem = _pantryItem.items[0];

                    return chai.request(app)
                        .delete(`/pantry-items/${pantryItem._id}`) 
                        .set('Authorization', `Bearer ${testUser.authToken}`)  
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return Pantry.findOne({'items._id': pantryItem._id});
                })
                .then(function(_pantryItem) {
                    expect(_pantryItem).to.be.null;
                });
        });
    });
});


describe('Recipe API resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return addRecipeUser();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoint', function() {

        it('should get all recipes', function() {
            let res;
            return chai.request(app)
                .get('/recipes/recipe-box')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.recipes).to.have.length.of.at.least(1);
    
                    return Recipe.aggregate([
                        {
                            $match: {user: ObjectId(_res.body.user)}
                        },
                        {
                            $project: { numberOfRecipes: {$size: "$recipes"}}
                        }]);
                })
                .then(function(count) {
                    expect(res.body.recipes).to.have.lengthOf(count[0].numberOfRecipes);
                });
        });

        it('should return a single recipe if passed id', function() {
            let recipeCard;

            return Recipe.findOne()
                .then(function(_recipeBox) {
                    recipeCard = _recipeBox.recipes[0];
                    return chai.request(app)
                        .get(`/recipes/recipe-box/${_recipeBox.recipes[0]._id}`)
                        .set('Authorization', `Bearer ${testUser.authToken}`)
                })
                .then(function(res) {
                    const resRecipe = res.body.recipes[0];
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(resRecipe).to.be.an('object');
                    expect(resRecipe.title).to.equal(recipeCard.title);
                    expect(resRecipe.image).to.equal(recipeCard.image);
                    expect(resRecipe.source).to.equal(recipeCard.source);
                    expect(resRecipe.sourceName).to.equal(recipeCard.sourceName);
                    expect(resRecipe.timeReady).to.equal(recipeCard.timeReady);
                    expect(resRecipe.servings).to.equal(recipeCard.servings);
                    expect(resRecipe.ingredients).to.be.an('array');
                    expect(resRecipe.instructions).to.be.an('array');
                });
        });

        it('should return recipes with right fields', function() {
            let resRecipe;

            return chai.request(app)
                .get('/recipes/recipe-box')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.recipes).to.be.an('array');
                    expect(res.body.recipes).to.have.lengthOf.at.least(1);

                    res.body.recipes.forEach(function(recipe) {
                        expect(recipe).to.be.an('object');
                        expect(recipe).to.have.keys('_id', 'title', 'image', 'source', 'sourceName', 'timeReady', 'servings', 'ingredients', 'instructions');
                    });

                    resRecipe = res.body.recipes[0];
                    return Recipe.findOne({user: ObjectId(res.body.user)});
                })
                .then(function(recipeBox) {
                    const recipe = recipeBox.recipes[0];
                    expect(resRecipe._id).to.equal(recipe._id.toString());
                    expect(resRecipe.title).to.equal(recipe.title);
                    expect(resRecipe.image).to.equal(recipe.image);
                    expect(resRecipe.source).to.equal(recipe.source);
                    expect(resRecipe.sourceName).to.equal(recipe.sourceName);
                    expect(resRecipe.timeReady).to.equal(recipe.timeReady);
                    expect(resRecipe.servings).to.equal(recipe.servings);
                });
        });
    });

    describe('Recipe Box POST endpoint', function() {

        it('should add new recipe', function() {
            const newRecipe = generateRecipeData();

            return chai.request(app)
                .post('/recipes')
                .set('Authorization', `Bearer ${testUser.authToken}`)
                .send(newRecipe)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');

                    const index = res.body.recipeBox.recipes.length - 1;
                    const newRecipeIndex = res.body.recipeBox.recipes[index];

                    expect(newRecipeIndex).to.include.keys('_id', 'title', 'image', 'source', 'sourceName', 'timeReady', 'servings', 'ingredients', 'instructions');
                    expect(newRecipeIndex.title).to.equal(newRecipe.title);
                    expect(newRecipeIndex.image).to.equal(newRecipe.image);
                    expect(newRecipeIndex.source).to.equal(newRecipe.source);
                    expect(newRecipeIndex.sourceName).to.equal(newRecipe.sourceName);
                    expect(newRecipeIndex.timeReady).to.equal(newRecipe.timeReady);
                    expect(newRecipeIndex.servings).to.equal(newRecipe.servings);
                    expect(newRecipeIndex.ingredients).to.be.an('array');
                    expect(newRecipeIndex.instructions).to.be.an('array');

                    return Recipe.findOne({user: ObjectId(res.body.recipeBox.user)});
                })
                .then(function(recipeBox) {
                    const index = recipeBox.recipes.length - 1;
                    expect(recipeBox.recipes[index].title).to.equal(newRecipe.title);
                    expect(recipeBox.recipes[index].image).to.equal(newRecipe.image);
                    expect(recipeBox.recipes[index].source).to.equal(newRecipe.source);
                    expect(recipeBox.recipes[index].sourceName).to.equal(newRecipe.sourceName);
                    expect(recipeBox.recipes[index].timeReady).to.equal(newRecipe.timeReady);
                    expect(recipeBox.recipes[index].servings).to.equal(newRecipe.servings);
                    expect(recipeBox.recipes[index].ingredients).to.be.an('array');
                    expect(recipeBox.recipes[index].instructions).to.be.an('array');
                });
        });
    });

    describe('Recipe Box DELETE endpoint', function() {

        it('should remove the requested recipe', function() {
            let recipe;

            return Recipe.findOne()
            .then(function(recipeBox) {
                recipe = recipeBox.recipes[0];

                return chai.request(app)
                    .delete(`/recipes/recipe-box/${recipe._id}`)
                    .set('Authorization', `Bearer ${testUser.authToken}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return Recipe.findOne({'recipes._id': recipe._id});
            })
            .then(function(_recipe) {
                expect(_recipe).to.be.null;
            });
        });
    });
});