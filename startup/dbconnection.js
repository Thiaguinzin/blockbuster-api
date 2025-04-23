const mongoose = require('mongoose');
const logger = require('../middleware/logger');
const config = require('config')
const db = config.get('db');

module.exports = function() {
    mongoose.connect(db)
        .then(() => {
            // console.log(`Connect to ${db}`);
        }, error => {
            logger.error(error);
            process.exit(1);
        });
}