'use strict';

const {router} = require('./authRouter');
const {localStrategy} = require('./strategies');

module.exports = {router, localStrategy};