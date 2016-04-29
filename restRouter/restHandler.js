var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var Validator = require('./helpers/validator');
var Aggregator = require('./helpers/aggregator');
var Secure = require('./helpers/secure');

var util = require('util');

module.exports = function (ModelName) {
    var Model = mongoose.model(ModelName);
    var Schema = Model.schema;
    var validator = new Validator(Schema);
    var aggregator = new Aggregator(Model);
    var secure  = new Secure(Schema);

    this.getItems = function (req, res, next) {
        var query = req.query || {};
        var aggregateObj = [];
        var user = req.user || {};
        var role = user.role || 0;

        aggregator.filter(query, aggregateObj);
        aggregator.expand(query, aggregateObj);
        aggregator.paginate(query, aggregateObj, function (err, count, aggregateObj) {
            if (err) {
                return next(err);
            }

            Model.aggregate(aggregateObj).exec(function (err, models) {
                if (err) {
                    return next(err);
                }

                secure.exportFilter(role, models);
                models.length ? models[0].totalCount = count : '';
                res.status(200).send(models);
            });
        });
    };

    this.getItem = function (req, res, next) {
        var id = ObjectId(req.params.id);
        var query = req.query || {};
        var aggregateObj = [{$match: {_id: id}}];
        var user = req.user || {};
        var role = user.role || 0;

        aggregator.filter(query, aggregateObj);
        aggregator.expand(query, aggregateObj);

        Model.aggregate(aggregateObj).exec(function (err, models) {
            if (err) {
                return next(err);
            }

            secure.exportFilter(role, models);
            res.status(200).send(models[0]);
        });
    };

    this.createItem = function (req, res, next) {
        var model = req.body || {};

        validator.validate(model, {}, function (err, model) {

        });
    };

    this.changeItem = function (req, res, next) {

    };

    this.deleteItem = function (req, res, next) {

    };

};
