const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 5,
        max: 50,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        min: 5,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 5,
        max: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(50),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(5).max(255),
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validateUser = validateUser;