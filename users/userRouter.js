'use strict';
const express = require('express');
const router = express.Router();

router.use(express.json());

const {User} = require('../models');

router.post('/', (req, res) => {
    const requiredFields = ['username', 'password', 'verifyPassword'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422, 
            reason: 'ValidationError',
            message: 'You are missing a required field!',
            location: missingField
        });
    }

    if (req.body.password !== req.body.verifyPassword) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Your passwords do not match!',
            location: 'Password'
        });
    }

    const stringFields = ['username', 'password', 'verifyPassword','firstName', 'lastName'];
    const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

    if (nonStringField) {
        return res.status(422).json({
            code: 422, 
            reason: 'ValidationError',
            message: `${nonStringField} must be a string!`,
            location: nonStringField
        });
    }

    const explicitlyTrimmedFields = ['username', 'password', 'verifyPassword'];
    const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'You cannot start or end with whitespace!',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10, 
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);

    const tooLargeField = Object.keys(sizedFields).find(field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `${tooSmallField} must be at least ${sizedFields[tooSmallField].min} characters long!`
                : `${tooLargeField} must be at most ${sizedFields[tooLargeField].max} characters long!`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName = '', lastName = ''} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason:'ValidationError',
                    message: 'That username is already taken!',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

module.exports = {router};