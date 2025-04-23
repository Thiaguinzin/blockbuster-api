const Joi = require('joi');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const { Rental, validateRental } = require('../models/rental');

router.get('/GetAll', async (req, res) => {
    const rentals = await Rental.find();
    res.send(rentals);
});

router.get('/GetById/:id', async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    res.send(rental);
});

router.post('/Create', auth, async (req, res) => {

    const { error, value } = validateRental(req.body);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    const customerId = req.body.customerId;
    const customerGotten = await Customer.findById(customerId);

    if (customerGotten == null || customerGotten == undefined) {
        res.status(404).send("Customer was not found.");
        return;
    }

    const movieId = req.body.movieId;
    const movieGotten = await Movie.findById(movieId);

    if (movieGotten == null || movieGotten == undefined) {
        res.status(404).send("Movie was not found.");
        return;
    }

    if (movieGotten.numberInStock < 1 || movieGotten.numberInStock == null) {
        res.status(404).send("Movie is out of stock.");
        return;
    }

    const rental = new Rental({
        customer: customerGotten,
        movie: movieGotten,
        dateOut: req.body.dateOut,
        dateReturned: req.body.dateReturned,
        rentalFee: req.body.rentalFee,
    });

    try {
        await rental.save();
        movieGotten.numberInStock = movieGotten.numberInStock - 1;
        await movieGotten.save();
        res.send(rental);
    } catch (error) {
        res.status(404).send("Cannot save the rental.")
    }

});

router.put('/Return/:id', auth, async (req, res) => {

    const rentalId = req.params.id;
    const rentalGotten = await Rental.findById(rentalId);

    if (rentalGotten == null || rentalGotten == undefined) {
        res.status(404).send("Rental was not found.");
        return;
    }

    if (rentalGotten.dateReturned != null) {
        res.status(400).send("Rental was already returned.");
        return;
    }    

    const customerGotten = await Customer.findById(rentalGotten.customer._id);

    if (customerGotten == null || customerGotten == undefined) {
        res.status(404).send("Customer was not found.");
        return;
    }

    const movieGotten = await Movie.findById(rentalGotten.movie._id);

    if (movieGotten == null || movieGotten == undefined) {
        res.status(404).send("Movie was not found.");
        return;
    }

    rentalGotten.calculateRentalFee();

    try {
        await rentalGotten.save();
        res.send(rentalGotten);
        movieGotten.numberInStock++;
        movieGotten.save();
    } catch (error) {
        res.status(404).send("Cannot save the rental.")
    };

});

router.delete('/Delete/:id', auth, async (req, res) => {

    const rentalId = req.params.id;
    const rentalGotten = await Rental.findById(rentalId);

    if (rentalGotten == null || rentalGotten == undefined) {
        res.status(404).send("Rental was not found.");
        return;
    }

    try {
        await rentalGotten.deleteOne();
        res.send(true);
    } catch (error) {
        res.status(404).send("Cannot save the rental.")
    };

});

function validateReturn(returnObj) {
    const schema = Joi.object({
        customerId: Joi.string().required(),
        movieId: Joi.string().required(),
    });

    return schema.validate(returnObj);
}


module.exports = router;