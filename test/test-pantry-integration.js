'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Pantry} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');


chai.use(chaiHttp);

function seedPantryData() {
    console.info('seeding pantry data');
    const seedData = [];

    for (let i=1; i<=10; i++) {
        seedData.push(generatePantryData());
    }

    return Pantry.insertMany(seedData);
}

function generateCategoryName() {
    const categories = [
        'Bread', 'Condiments', 'Canned', 'Dairy', 'Dry/Baking', 'Frozen', 'Fruits', 'Meats', 'Snacks', 'Spices/Seasonings', 'Vegetables', 'Miscellaneous'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

function generatePantryData() {
    return {
        name: faker.commerce.productName(),
        quantity: faker.random.number(),
        category: generateCategoryName()
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
        return seedPantryData();
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
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.pantryItems).to.have.length.of.at.least(1);

                    return Pantry.count();
                })
                .then(function(count) {
                    expect(res.body.pantryItems).to.have.lengthOf(count);
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
});