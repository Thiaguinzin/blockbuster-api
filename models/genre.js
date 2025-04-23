const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: function() {
            return this.isNew;
        },
        minlength: 5,
        maxlength: 30,
        uppercase: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: false
    }
})

const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(body, isNew) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(30).when(
            '$isNew', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }
        ),
        active: Joi.boolean()
    });

    return schema.validate(body);
}

exports.Genre = Genre;
exports.validate = validateGenre;
exports.genreSchema = genreSchema;