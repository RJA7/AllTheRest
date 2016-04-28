var mongoose = require('mongoose');
var Validator = require('./helpers/validator');
var Aggregator = require('./helpers/aggregator');

var util = require('util');

module.exports = function (ModelName) {
    var Model = mongoose.model(ModelName);
    var Schema = Model.schema;
    var validator = new Validator(Schema);
    var aggregator = new Aggregator(Model);

    this.getItems = function (req, res, next) {
        var query = req.query || {};
        var aggregateObj = aggregator.filter(query, []);
        aggregator.expand(query, aggregateObj);
        aggregator.paginate(query, aggregateObj, function (err, count, aggregateObj) {
            if (err) {
                return next(err);
            }

            Model.aggregate(aggregateObj).exec(function (err, models) {
                if (err) {
                    return next(err);
                }

                models.length ? models[0].totalCount = count : '';
                res.status(200).send(models);
            });
        });
    };

    this.getItem = function (req, res, next) {

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
