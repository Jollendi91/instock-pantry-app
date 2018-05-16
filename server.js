'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const {Pantry} = require('./models');

const app = express();

const {router: pantryItemsRouter} = require('./routers/pantryItemsRouter');
const {router: recipesRouter} = require('./routers/recipesRouter');

const {router: userRouter} = require('./users');
const {localStrategy} = require('./auth');

passport.use(localStrategy);


app.use('/pantry-items', pantryItemsRouter);
app.use('/recipes', recipesRouter);

app.use(express.json());
app.use(morgan('common'));
app.use(express.static('public'));



let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

