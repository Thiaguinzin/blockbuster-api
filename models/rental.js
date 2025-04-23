const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { customerSchema } = require('../models/customer');
const { movieSchema } = require('../models/movie');


const rentalSchema = new mongoose.Schema({
    
    customer: {
        type: customerSchema,
        required: true
    },
    movie: {
        type: movieSchema,
        required: true
    },
    dateOut: {
        type: Date,
        default: Date.now
    },
    dateReturned: {
        type: Date,
        default: null
    },
    rentalFee: {
        type: Number,
        min: 0,
        default: 0
    }

});

rentalSchema.methods.calculateRentalFee = function() {
    this.dateReturned = Date.now();

    const diffInMs = Math.abs(this.dateReturned - this.dateOut);
    const daysRented = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    this.rentalFee = this.movie.dailyRentalRate * (daysRented < 1 ? 1 : daysRented);
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
        dateOut: Joi.date(),
        dateReturned: Joi.date(),
        rentalFee: Joi.number().min(0),
    });

    return schema.validate(rental);
}

exports.Rental = Rental;
exports.validateRental = validateRental;