'use strict';
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

router.use(express.json());

const createAuthToken = function (user) {
    return jwt.sign({
        user
    }, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {
    session: false
});

router.post('/login', localAuth, (req, res) => {
    const authToken = createAuthToken(req.user.serialize());
    res.json({
        authToken
    });
});

const jwtAuth = function (req, res, next) {
    passport.authenticate('jwt', {
        sessions: false
    }, function (err, user) {
        if (err) {
            return next(err);
        };
        if (!user) {
            return res.status(401).send({
                redirect: '/'
            });
        };
        req.user = user;
        next();
    })(req, res, next);
}

router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({
        authToken
    });
});

router.get('/logout', jwtAuth, (req, res) => {
    req.logout();
    res.send({
        redirect: '/'
    });
});

module.exports = {
    router,
    jwtAuth
};