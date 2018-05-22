'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Pantry, User} = require('../models');
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
                    console.log(_res);
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.items).to.have.length.of.at.least(1);

                    return Pantry.count();
                })
                .then(function(count) {
                    expect(res.body.items).to.have.lengthOf(count);
                });
        });

        it('should return a single item if passed id', function() {
            let pantryItem;
            
            return Pantry.findOne()
                .then(function(_pantryItem) {
                    pantryItem = _pantryItem;

                    return chai.request(app)
                        .get(`/pantry-items/${_pantryItem.id}`)
                })
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body.name).to.equal(pantryItem.name);
                    expect(res.body.quantity).to.equal(pantryItem.quantity);
                    expect(res.body.category).to.equal(pantryItem.category);
                });
        });

        it('should return pantry items with right fields', function() {
            let resPantryItem;

            return chai.request(app)
                .get('/pantry-items')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.pantryItems).to.be.an('array');
                    expect(res.body.pantryItems).to.have.lengthOf.at.least(1);

                    res.body.pantryItems.forEach(function(item) {
                        expect(item).to.be.an('object');
                        expect(item).to.include.keys('id', 'name', 'quantity', 'category', 'dateAdded');
                    });

                    resPantryItem = res.body.pantryItems[0];
                    return Pantry.findById(resPantryItem.id);
                })
                .then(function(pantryItem) {
                    expect(resPantryItem.id).to.equal(pantryItem.id);
                    expect(resPantryItem.name).to.equal(pantryItem.name);
                    expect(resPantryItem.quantity).to.equal(pantryItem.quantity);
                    expect(resPantryItem.category).to.equal(pantryItem.category);
                    expect(pantryItem.dateAdded).to.not.be.null;
                });
        });
    });

    describe('POST endpoint', function() {

        it('should add a new pantry item', function() {

            const newPantryItem = generatePantryData();

            return chai.request(app)
                .post('/pantry-items')
                .send(newPantryItem)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys('_id', 'name', 'quantity', 'category', 'dateAdded');
                    expect(res.body.name).to.equal(newPantryItem.name);
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.quantity).to.equal(newPantryItem.quantity);
                    expect(res.body.category).to.equal(newPantryItem.category);

                   return Pantry.findById(res.body._id);
                })
                .then(function(pantryItem) {
                    expect(pantryItem.name).to.equal(newPantryItem.name);
                    expect(pantryItem.quantity).to.equal(newPantryItem.quantity);
                    expect(pantryItem.category).to.equal(newPantryItem.category);
                    expect(pantryItem.dateAdded).to.not.be.null;
                });
        });
    });

    describe('PUT endpoint', function() {

        it('should update fields sent over', function() {
            const updateData = {
                name: 'Updated Grapes',
                category: 'Fruits'
            };

            return Pantry
                .findOne()
                .then(function(pantryItem) {
                    updateData.id = pantryItem.id;

                    return chai.request(app)
                        .put(`/pantry-items/${pantryItem.id}`)
                        .send(updateData)
                        .then(function(res) {
                            expect(res).to.have.status(204);

                            return Pantry.findById(updateData.id);
                        })
                        .then(function(pantryItem) {
                            expect(pantryItem.name).to.equal(updateData.name);
                            expect(pantryItem.category).to.equal(updateData.category);
                        });
                });
        });
    });

   describe('DELETE endpoint', function() {

        it('should remove the requested item', function() {
            let pantryItem;
            Pantry
                .findOne()
                .then(function(_pantryItem) {
                    pantryItem = _pantryItem;

                    return chai.request(app)
                        .delete(`/pantry-items/${pantryItem.id}`)    
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return Pantry.findById(pantryItem.id);
                })
                .then(function(_pantryItem) {
                    expect(_pantryItem).to.be.null;
                });
        });
    });
});