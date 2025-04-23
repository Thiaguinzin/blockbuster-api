const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Customer, validate } = require('../models/customer');
const movieModels = require('../models/movie');

router.get('/GetAll', async (req, res) => {

    const customers = await Customer.find();
    // const customers = await Customer.find().populate('rentedMovie', 'name -_id');
    res.send(customers);

});

router.get('/GetById/:id', async (req, res) => {

    const id = req.params.id;

    const customer = await Customer.findById(id);

    if (customer == null || customer == undefined) {
        res.statys(404).send("Customer was not found.");
        return;
    }

    res.send(customer);

});

router.post('/Create', auth, async (req, res) => {

    var { error, value } = validate(req.body, true);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    const customerCreate = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold,
    });

    try {
        await customerCreate.save();
        res.send(customerCreate);
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

router.post('/AddMovie/:id', auth, async (req, res) => {

    const customerMovie = await Customer.findById(req.params.id);

    var { error, value } = movieModels.validate(req.body, true);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    const movieAdd = new movieModels.Movie({
        name: req.body.name,
    });

    customerMovie.rentedMovie.push(movieAdd)

    try {
        await customerMovie.save();
        res.send(customerMovie);
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

router.delete('/RemoveMovie/:id/:movieId', auth, async (req, res) => {
    const customerGotten = await Customer.findById(req.params.id);
    const movieGotten = customerGotten.rentedMovie.id(req.params.movieId);
    movieGotten.deleteOne();
    customerGotten.save();
    res.send(customerGotten);
})

router.put('/Update/:id', auth, async (req, res) => {

    const id = req.params.id;
    const customerGotten = await Customer.findById(id);

    if (customerGotten == null || customerGotten == undefined) {
        res.status(404).send("Customer was not found.");
        return;
    }

    var { error, value } = validate(req.body, false);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    customerGotten.phone = req.body.phone != null ? req.body.phone : customerGotten.phone;
    customerGotten.isGold = req.body.isGold != null ? req.body.isGold : customerGotten.isGold;

    try {
        await customerGotten.save();
        res.send(customerGotten);
    } catch (error) {
        console.log(error)
        res.send(error.message);
    }

});

router.delete('/Delete/:id', auth, async (req, res) => {

    const id = req.params.id;
    const customerGotten = await Customer.findById(id);

    if (customerGotten == null || customerGotten == undefined) {
        res.status(404).send("Customer was not found.");
        return;
    }

    try {
        await Customer.deleteOne(customerGotten);
        res.send(true)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }

});

module.exports = router;