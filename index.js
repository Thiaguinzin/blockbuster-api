var express = require('express');
const app = express();

require('./startup/logger')();
require('./startup/routes')(app);
require('./startup/dbconnection')();
require('./startup/configuration')();
require('./startup/prod')(app);

const server = app.listen(3000, () => {
    // console.log('Listening on port 3000...')
});

module.exports = server;