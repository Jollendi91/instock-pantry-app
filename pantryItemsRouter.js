const express = require('express');
const router = express.Router();

router.use(express.json());

const {Pantry} = require('./models');

router.get('/', (req, res) => {
    Pantry
        .find()
        .then(pantryItems => {
            res.json({
                pantryItems: pantryItems.map((item) => item.serialize())
            });
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

router.post('/', (req, res) => {
   
    const requiredFields = ['name', 'quantity', 'category'];
    for (i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing '${field}' in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Pantry
        .create({
            name: req.body.name,
            quantity: req.body.quantity,
            category: req.body.category,
            dateAdded: Date.now()
        })
        .then(item => res.status(201).json(item))
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
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
    Pantry
        .findByIdAndRemove(req.params.id)
        .then(pantryItem => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;