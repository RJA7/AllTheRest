var restRouter = require('../restRouter');    //require('rest-router')

module.exports = function (app) {
    app.use('/users', restRouter('user'));

    app.use(notFound);
    app.use(errorHandler);

    return app;
};


function notFound(req, res, next) {
    var err = {message: 'Not Found', status: 404};
    return next(err);
}

function errorHandler(err, req, res, next) {
    var status = err.status || 500;

    console.log(err);
    return res.status(status).send(err);
}
