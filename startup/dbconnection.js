const mongoose = require('mongoose');
const logger = require('../middleware/logger');
const config = require('config')
const db = config.get('db');

module.exports = function() {
    mongoose.connect(process.env.DATABASE_URL ? process.env.DATABASE_URL : db)
        .then(() => {
            // console.log(`Connect to ${db}`);
        }, error => {
            logger.error(error);
            process.exit(1);
        });
}