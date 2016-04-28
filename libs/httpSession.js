var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function () {
        return session({
        name             : 'courses.sid',
        resave           : false, /* ATTENTION: this must be discuss for every project */
        rolling          : true,
        saveUninitialized: false, /* ATTENTION: this must be discuss for every project */
        secret           : 'secret key for tech shop', /* ATTENTION: this must be unique for every project */
        cookie           : {
            maxAge: 60 * 60 * 24 * 1000
        },
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            touchAfter: 24 * 3600
        })
    });
};
