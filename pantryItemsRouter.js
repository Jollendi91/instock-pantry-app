const express = require('express');
const router = express.Router();

router.use(express.json());

const {Pantry} = require('./models');

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

module.exports = router;