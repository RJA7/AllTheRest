var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var Aggregator = require('./helpers/aggregator');
var Secure = require('./helpers/secure');

module.exports = function (ModelName) {
    var self = this;
    var Model = mongoose.model(ModelName);
    var Schema = Model.schema;
    var options = Schema.options || {};
    var aggregator = new Aggregator(Model);
    var secure = new Secure(Schema);
    var init = options.init;
    var validate = options.validate;
    if (!init || typeof init !== 'function') {
        init = function () {}
    }
    if (!validate || typeof validate !== 'function') {
        validate = function () {}
    }

    this.getItems = function (req, res, next) {
        var query = req.query || {};
        var aggregateObj = [];

        aggregator.filter(query, aggregateObj);
        aggregator.search(query, aggregateObj);
        aggregator.expand(query, aggregateObj);
        aggregator.paginate(query, aggregateObj, function (err, count, aggregateObj) {
            if (err) {
                return next(err);
            }

            Model.aggregate(aggregateObj).exec(function (err, models) {
                if (err) {
                    return next(err);
                }

                secure.exportFilter(req, models);
                models.length ? models[0].totalCount = count : '';
                res.status(200).send(models);
            });
        });
    };

    this.getItem = function (req, res, next) {
        init(req);
        var id = ObjectId(req.params.id);
        var query = req.query || {};
        var aggregateObj = [{$match: {_id: id}}];

        aggregator.expand(query, aggregateObj);

        Model.aggregate(aggregateObj).exec(function (err, models) {
            if (err) {
                return next(err);
            }

            secure.exportFilter(req, models);
            res.status(200).send(models[0]);
        });
    };

    this.createItem = function (req, res, next) {
        init(req);
        var model = req.body || {};
        validate(model, true);
        secure.importFilter(req, model);

        Model.create(model, function (err, model) {
            if (err) {
                return next(err);
            }
            req.params.id = model.id;

            return self.getItem(req, res, next);
        });
    };

    this.changeItem = function (req, res, next) {
        init(req);
        var id = req.params.id;
        var model = req.body || {};
        validate(model, false);
        secure.importFilter(req, model);

        Model.findByIdAndUpdate(id, model, function (err, model) {
            if (err) {
                return next(err);
            }
            req.params.id = model.id;

            return self.getItem(req, res, next);
        });
    };

    this.updateItem = function (req, res, next) {
        init(req);
        var id = req.params.id;
        var model = req.body || {};
        validate(model, false);
        secure.importFilter(req, model);

        Model.findByIdAndUpdate(id, {$set: model}, function (err, model) {
            if (err) {
                return next(err);
            }
            req.params.id = model.id;

            return self.getItem(req, res, next);
        });
    };

    this.deleteItem = function (req, res, next) {
        init(req);
        Model.findByIdAndRemove(req.params.id, function (err, model) {
            if (err) {
                return next(err);
            }
            secure.exportFilter(req, [model]);

            return res.status(200).send(model);
        });
    };

};
