const config = require('config')
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { User, validateUser } = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/Create', async (req, res) => {

    const { error, value } = validateUser(req.body);

    if (error != null) {
        res.status(404).send(error.message);
        return;
    }

    const userGotten = await User.findOne({email: req.body.email});

    if (userGotten != null || userGotten != undefined) {
        res.status(404).send("There's already a user with this email.");
        return;
    }

    const user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(user.password, salt);
    user.password = hashed;

    try {
        await user.save();
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))
    } catch (error) {
        console.log(error);
        res.status(404).send("There's was a error saving the user.")
    }

});

router.get('/me', auth, async (req, res) => {

    const token = req.header('x-auth-token');

    if(!token) {
        res.status(404).send('No token provied.');
        return;
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const user = await User.findById(decoded._id);
        res.send(_.pick(user, ['name', 'email']));
    } catch (error) {
        res.status(400).send('Invalid token.');
    }

})

module.exports = router;
