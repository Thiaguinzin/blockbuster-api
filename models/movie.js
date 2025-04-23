const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { genreSchema } = require('../models/genre');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 55
    },
    genre: {
        type: [genreSchema],
        required: true
    },
    numberInStock: {
        type: Number,
        default: 0
    },
    dailyRentalRate: {
        type: Number,
        default: 0
    }
});

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(customer, isNew) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(55).when(
            '$isNew', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }
        ),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number()
    });

    return schema.validate(customer);
}

exports.Movie = Movie;
exports.validate = validateMovie;
exports.movieSchema = movieSchema;