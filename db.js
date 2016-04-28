var mongoose = require('mongoose');
var logger = require('./libs/log')(module);
var env = process.env;

mongoose.connect(env.DB_HOST, env.DB_NAME, env.DB_PORT, {
    user: env.DB_USER,
    pass: env.DB_PASS
});

require('./models');

db = mongoose.connection;

db.once('connected', onConnected);
db.on('error', onError);

function onConnected() {
    logger.info('Connected to MongoDB');
}

function onError(err) {
    logger.info('No connection to db');
}
