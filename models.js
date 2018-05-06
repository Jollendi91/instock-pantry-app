'use strict';

const mongoose = require('mongoose');

const pantrySchema = mongoose.Schema({
    name: {type: String, required: true},
    quantity: {type: Number, required: true},
    category: {type: String, required: true},
    dateAdded: {type: Date}
});

pantrySchema.virtual('itemString').get(function() {
    return `${this.quantity} - ${this.name}`.trim()
});

pantrySchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        quantity: this.quantity,
        category: this.category,
        dateAdded: this.dateAdded
    }
}

const Pantry = mongoose.model('Pantry', pantrySchema);

module.exports = {Pantry};