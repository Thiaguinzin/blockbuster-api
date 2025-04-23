const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Movie, validate } = require('../models/movie');
const {Genre} = require('../models/genre');


router.get('/GetAll', async (req, res) => {

    const movies = await Movie.find();
    res.send(movies);

});

router.get('/GetById/:id', async (req, res) => {

    const id = req.params.id;

    const movie = await Movie.findById(id);

    if (movie == null || movie == undefined) {
        res.statys(404).send("Movie was not found.");
        return;
    }

    res.send(movie);

});

router.post('/Create', auth, async (req, res) => {

    var { error, value } = validate(req.body, true);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    const genre = await Genre.findById(req.body.genreId);

    if (genre == null || genre == undefined) {
        res.status(404).send("Genre was not found.");
        return;
    }

    const movieCreate = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name,
            isActive: genre.isActive
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    try {
        await movieCreate.save();
        res.send(movieCreate);
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

router.put('/Update/:id', auth, async (req, res) => {

    const id = req.params.id;
    const movieGotten = await Movie.findById(id);

    if (movieGotten == null || movieGotten == undefined) {
        res.status(404).send("Movie was not found.");
        return;
    }

    var { error, value } = validate(req.body, false);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    // customerGotten.phone = req.body.phone != null ? req.body.phone : customerGotten.phone;
    // customerGotten.isGold = req.body.isGold != null ? req.body.isGold : customerGotten.isGold;

    try {
        await movieGotten.save();
        res.send(movieGotten);
    } catch (error) {
        console.log(error)
        res.send(error.message);
    }

});

router.delete('/Delete/:id', auth, async (req, res) => {

    const id = req.params.id;
    const movieGotten = await Movie.findById(id);

    if (movieGotten == null || movieGotten == undefined) {
        res.status(404).send("Movie was not found.");
        return;
    }

    try {
        await Customer.deleteOne(movieGotten);
        res.send(true)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

module.exports = router;