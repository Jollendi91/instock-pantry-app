'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use(express.json());

const {Pantry} = require('../models');

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', jwtAuth, (req, res) => {
    console.log(req);
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
        .findById(req.params.id)
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

    console.log(itemNameCapital);

    Pantry.findOneAndUpdate({
        user: req.user._id,
        'items.name': { $ne: req.body.name},
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

    /* Pantry.findOne({name: {$regex : `${req.body.name}?`, $options : 'i'}})
    .then(function(pantryItem) {
        if (pantryItem) {
            return res.status(200).json({message: `This item already exists!`}).end();
        }
        else {
          return  Pantry
                    .create({
                        name: req.body.name,
                        quantity: req.body.quantity,
                        category: req.body.category,
                        dateAdded: Date.now()
                    });
        }
    })*/
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.put('/:id', (req, res) => {
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
        .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
    Pantry
        .findByIdAndRemove(req.params.id)
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};