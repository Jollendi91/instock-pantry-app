'use strict';
const express = require('express');
const router = express.Router();

router.use(express.json());

const {User} = require('../models');

router.post('/', (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422, 
            reason: 'ValidationError',
            message: 'MIssing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

    if (nonStringField) {
        return res.status(422).json({
            code: 422, 
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const explicitlyTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }
})