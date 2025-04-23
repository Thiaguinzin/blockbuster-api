const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config')

router.post('/Login', async (req, res) => {

    const { error, value } = validateUser(req.body);

    if (error != null) {
        res.status(400).send(error.message);
        return;
    }

    const userGotten = await User.findOne({email: req.body.email});

    if (userGotten == null || userGotten == undefined) {
        res.status(400).send("Invalid email or password.");
        return;
    }

    const validPassword = await bcrypt.compare(req.body.password, userGotten.password);

    if (!validPassword) {
        res.status(400).send("Invalid email or password.");
        return;
    }

    const token = userGotten.generateAuthToken();
    res.send(token);
});

function validateUser(user) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(5).max(255),
    });

    return schema.validate(user);
}


module.exports = router;
