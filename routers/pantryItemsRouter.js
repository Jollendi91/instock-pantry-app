'use strict';

const express = require('express');
const router = express.Router();

router.use(express.json());

const {Pantry} = require('../models');

const{jwtAuth} = require('../auth');

router.get('/', jwtAuth, (req, res) => {
    Pantry
        .findOne({user: req.user._id})
        .then(userPantry => {
            res.json(userPantry);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.get('/:id', (req, res) => {
    Pantry
        .find({"items._id": req.params.id}, {"items.$": 1, _id: 0 })
        .then(pantyItem => res.json(pantyItem))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.post('/', jwtAuth, (req, res) => {
   
    const requiredFields = ['name', 'quantity', 'category'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing '${field}' in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    let itemNameCapital = req.body.name.charAt(0).toUpperCase() + req.body.name.substr(1);

    const newItem = {
        name: itemNameCapital,
        quantity: req.body.quantity,
        category: req.body.category
    };

    let expression = `${req.body.name}?`;
    let itemNameRegex = new RegExp(expression, 'i');

    Pantry.findOneAndUpdate({
        user: req.user._id,
        'items.name': { $ne: itemNameCapital},
        'items.name': { $not: itemNameRegex },
    }, 
        {
        $set: {user: req.user._id},
        $push: {items: [newItem]}
      },
      {
        new: true, 
        upsert: true
      })
      .then(pantry =>{
          res.status(201).json({
              pantry: pantry.serialize(),
              newItem: newItem
        });
      })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.put('/:id', jwtAuth, (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['name', 'quantity', 'category'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Pantry
        .findOneAndUpdate({'items._id': req.params.id}, {$set: {'items.$.quantity': toUpdate.quantity}}, {new: true})
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', jwtAuth, (req, res) => {
    Pantry
        .findOneAndUpdate({'items._id': req.params.id}, {$pull: {items: {_id: req.params.id}}})
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router, jwtAuth};