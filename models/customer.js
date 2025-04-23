const mongoose = require('mongoose');
const Joi = require('joi');
const { movieSchema } = require('../models/movie');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 55
    },
    phone: {
        type: String,
    },
    isGold: {
        type: Boolean,
        default: false
    }
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer, isNew) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(55).when(
            '$isNew', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }
        ),
        phone: Joi.string().min(5).max(12),
        isGold: Joi.boolean()
    });

    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
exports.customerSchema = customerSchema;