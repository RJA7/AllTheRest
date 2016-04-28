var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var validator = require('validator');
var _ = require('underscore');

var defaultSortField = '_id';
var defaultLimit = 100;

module.exports = function (Model) {
    var Schema = Model.schema;
    var tree = Schema.tree;
    var filterFields = getFilterFields();
    var expandFields = getExpandFields();

    this.filter = function (query, aggregateObj) {
        var filterValues = query.filter;
        var i = filterFields.length;
        var j;
        var value;
        var keyValueObj;
        var filterObj = [];

        if (!filterValues || !i) {
            return aggregateObj;
        }

        if (!(filterValues instanceof Array)) {
            filterValues = [filterValues];
        }

        while (i--) {
            j = filterValues.length;
            while (j--) {
                value = filterValues[j];
                value = validator.isMongoId(value) ? ObjectId(value) : value;

                keyValueObj = {};
                keyValueObj[filterFields[i]] = value;

                filterObj.push(keyValueObj);
            }
        }
        aggregateObj.push({$match: {$or: filterObj}});

        return aggregateObj;
    };

    this.expand = function (query, aggregateObj) {
        var expandValues = query.expand;
        var i = expandValues.length;
        var j;
        var value;

        if (!expandValues || !i) {
            return aggregateObj;
        }

        if(!(expandValues instanceof Array)) {
            expandValues = [expandValues];
        }

        while (i--) {
            j = expandValues.length;
            while (j--) {
                value = expandValues[j];
                if (expandFields[i] == value) {
                    if (tree[expandFields[i]] instanceof Array) {
                        many(aggregateObj, value);
                    } else {
                        one(aggregateObj, value);
                    }
                }
            }
        }

        return aggregateObj;
    };

    this.paginate = function(query, aggregateObj, cb) {
        var sortField = query.sortfield || defaultSortField;
        var sortOrder = query.sortorder || 1;
        var skip = query.skip || 0;
        var limit = query.limit || defaultLimit;
        var sortObj = {};
        sortObj[sortField] = sortOrder;

        aggregateObj.push({
            $group: {
                _id: 'id',
                count: {$sum: 1}
            }
        });

        Model.aggregate(aggregateObj).exec(function (err, countObj) {
            aggregateObj.pop();
            aggregateObj.push({
                $sort: sortObj
            }, {
                $skip: skip
            }, {
                $limit: limit
            });

            cb(err, countObj[0].count, aggregateObj);
        });
    };


    function getFilterFields() {
        var keys = Object.keys(tree);
        var i = keys.length;
        var filterFields = [];

        while (i--) {
            tree[keys[i]].filter ? filterFields.push(keys[i]) : '';
        }

        return filterFields;
    }

    function getExpandFields() {
        var keys = Object.keys(tree);
        var i = keys.length;
        var expandFields = [];
        var path;
        var key;

        while(i--) {
            if ((key = keys[i]) == '_id') continue;
            path = tree[key];

            if (path instanceof Array) {
                path[0].type.schemaName == 'ObjectId' ? expandFields.push(keys[i]) : '';
            } else {
                path.type = path.type || {};
                path.type.schemaName == 'ObjectId' ? expandFields.push(keys[i]) : '';
            }
        }

        return expandFields;
    }

    function one(aggregateObj, childPathName) {
        var parentKeys = filter(Object.keys(tree));
        var childModelName = tree[childPathName].ref;
        var projectObj = {};
        var childModel;
        var childCollectionName;
        var i;

        if (!childModelName) return;

        childModel = mongoose.model(childModelName);
        childCollectionName = childModel.collection.collectionName;

        for (i = 0; i < parentKeys.length; i++) {
            if (parentKeys[i] === childPathName) {
                projectObj[parentKeys[i]] = {$arrayElemAt: ['$' + childPathName, 0]};
                continue;
            }
            projectObj[parentKeys[i]] = 1;
        }

        aggregateObj.push({
            $lookup: {
                from: childCollectionName,
                foreignField: '_id',
                localField: childPathName,
                as: childPathName
            }
        }, {
            $project: projectObj
        });
    }

    function many(aggregateObj, childPathName) {
        var parentKeys = filter(Object.keys(tree));
        var childModelName = tree[childPathName][0].ref;
        var projectObj = {};
        var childGroup = {};
        var _idGroup = {};
        var group = {};
        var childCollectionName;
        var childModel;
        var childKeys;
        var i;

        if (!childModelName) return;

        childModel = mongoose.model(childModelName);
        childCollectionName = childModel.collection.collectionName;
        childKeys = filter(Object.keys(childModel.schema.tree));

        for (i = 0; i < parentKeys.length; i++) {
            if (parentKeys[i] === childPathName) {
                projectObj[parentKeys[i]] = {$arrayElemAt: ['$' + childPathName, 0]};
                continue;
            }
            projectObj[parentKeys[i]] = 1;
        }

        aggregateObj.push({
            $unwind: {
                path: '$' + childPathName,
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: childCollectionName,
                foreignField: '_id',
                localField: childPathName,
                as: childPathName}
        }, {
            $project: projectObj
        });

        //group
        for (i = 0; i < parentKeys.length; i++) {
            if (parentKeys[i] === childPathName) {
                continue;
            }
            _idGroup[parentKeys[i]] = '$' + parentKeys[i];
        }
        for (i = 0; i < childKeys.length; i++) {
            childGroup[childKeys[i]] = '$' + childPathName + '.' + childKeys[i];
        }
        group._id = _idGroup;
        group[childPathName] = {$push: childGroup};

        //project
        projectObj = {};
        for (i = 0; i < parentKeys.length; i++) {
            if (parentKeys[i] === childPathName) {
                projectObj[parentKeys[i]] = 1;
                continue;
            }
            projectObj[parentKeys[i]] = '$_id.' + parentKeys[i];
        }

        aggregateObj.push({
            $group: group
        }, {
            $project: projectObj
        });
    }

    function filter(arr) {
        return _.filter(arr, function (val) {
            return val !== '__v' && val !== 'id';
        });
    }
};
