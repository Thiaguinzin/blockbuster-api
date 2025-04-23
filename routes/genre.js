const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
const { Genre, validate } = require('../models/genre');


router.get('/GetAll', asyncMiddleware(async (req, res, next) => {
    const genres = await Genre.find().sort({name: 1});
    res.send(genres);
}));

router.get('/GetById/:id', validateObjectId, async (req, res) => {
    
    const id = req.params.id;
    const genre = await Genre.findById(id);

    if (genre == null || genre == undefined) {
        res.status(404).send('The genre with the given ID was not found');
    }

    res.send(genre);
});

router.post('/Create', auth, async (req, res) => {

    var { error, value } = validate(req.body, true);

    if (error != null) {
        res.status(400).send(error.message);
        return;
    }

    const genre = new Genre({
        name: req.body.name,
        active: req.body.active
    });

    try {
        await genre.save();
        res.send(genre);
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

router.put('/Update/:id', auth, async (req, res) => {
    
    const id = req.params.id;
    const genre = await Genre.findById(id);

    if (genre == null) {
        res.status(404).send("The genre was not found!");
        return;
    }

    var { error, value } = validate(req.body, false);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    genre.active = req.body.active;

    const result = await genre.save();
    res.send(result);
});

router.delete('/Delete/:id', [auth, admin], async (req, res) => {
    
    const id = req.params.id;
    const genre = Genre.findById(id);

    if (genre == null) {
        res.status(404).send("The genre was not found!");
        return;
    }

    try {
        await genre.deleteOne({_id: id});
        res.send(true);
    } catch (error) {
        console.log(error)
        res.send(error.message);
    }

});

module.exports = router;