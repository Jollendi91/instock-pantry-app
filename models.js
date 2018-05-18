'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const pantrySchema = mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        unique: true,
        required: [true, 'No User id found'] 
    },
    items: [{
        name: {type: String, required: true},
    quantity: {type: Number, required: true},
    category: {type: String, required: true},
    dateAdded: {type: Date}
    }]  
});

pantrySchema.index( { "user": 1, "items.name": 1 }, { unique: true }); 

pantrySchema.virtual('itemString').get(function() {
    return `${this.quantity} - ${this.name}`.trim()
});

pantrySchema.methods.serialize = function() {
    return {
        items: this.items
    }
}

const Pantry = mongoose.model('Pantry', pantrySchema);

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''}
});

UserSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
    };
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);


module.exports = {Pantry, User};