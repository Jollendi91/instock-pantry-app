'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Pantry} = require('./models');
const {app, runServer, closeServer} = require('./server');
const {TEST_DATABASE_URL} = require('./config');


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
    }
}