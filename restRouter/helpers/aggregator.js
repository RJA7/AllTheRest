var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var escape = require('escape-html');

module.exports = function (Model) {
    var Schema = Model.schema;
    var options = Schema.options || {};
    var paths = Schema.paths;
    var tree = Schema.tree;
    var expandFields = getExpandFields();

    this.filter = function (query, aggregateObj) {
        var filterField = options.filterField || '_id';
        var type = paths[filterField].instance;
        var filterValues = query.filter;
        var filterObj = [];
        var keyValueObj;
        var value;
        var i;

        if (!filterValues) return;

        if (!(filterValues instanceof Array)) {
            filterValues = [filterValues];
        }

        i = filterValues.length;
        while (i--) {
            value = escape(filterValues[i]);
            value = type == 'ObjectID' ? ObjectId(value) : value;
            value = type == 'Number' ? Number(value) : value;
            value = type == 'Date' ? new Date(value) : value;

            keyValueObj = {};
            keyValueObj[filterField] = value;

            filterObj.push(keyValueObj);
        }
        aggregateObj.push({$match: {$or: filterObj}});
    };

    this.search = function (query, aggregateObj) {
        var searchFields = options.searchFields || [];
        var i = searchFields.length;
        var value = query.search;
        var searchObj = [];
        var keyValueObj;

        if (!value || !i) return;

        if (!(searchFields instanceof Array)) {
            searchFields = [searchFields];
        }

        value = escape(query.search);
        while (i--) {
            keyValueObj = {};
            keyValueObj[searchFields[i]] = {$regex: value, $options: 'i'};

            searchObj.push(keyValueObj);
        }
        aggregateObj.push({$match: {$or: searchObj}});
    };

    this.expand = function (query, aggregateObj) {
        var expandValues = query.expand || {};
        var i = expandValues.length;
        var value;
        var j;

        if (!expandValues || !i) return;

        if (!(expandValues instanceof Array)) {
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
    };

    this.paginate = function (query, aggregateObj, cb) {
        var sortField = query.sortfield || options.defaultSortField || '_id';
        var sortOrder = parseInt(query.sortorder) || 1;
        var skip = parseInt(query.skip) || 0;
        var limit = parseInt(query.limit) || options.defaultLimit || Number.MAX_VALUE;
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

            countObj[0] = countObj[0] || {};
            cb(err, countObj[0].count, aggregateObj);
        });
    };


    function getExpandFields() {
        var keys = Object.keys(paths);
        var expandFields = [];
        var i = keys.length;
        var path;
        var type;
        var key;

        while (i--) {
            if ((key = keys[i]) == '_id') continue;
            path = paths[key];
            type = path.instance;
            type = type == 'Array' ? path.caster.instance : type;
            type == 'ObjectID' ? expandFields.push(key) : '';
        }

        return expandFields;
    }

    function one(aggregateObj, childPathName) {
        var childModelName = tree[childPathName].ref;
        var parentKeys = filter(Object.keys(tree));
        var i = parentKeys.length;
        var childCollectionName;
        var projectObj = {};
        var childModel;

        if (!childModelName) return;

        childModel = mongoose.model(childModelName);
        childCollectionName = childModel.collection.collectionName;

        while (i--) {
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
        var i = parentKeys.length;
        var childCollectionName;
        var projectObj = {};
        var childGroup = {};
        var _idGroup = {};
        var group = {};
        var childModel;
        var childKeys;

        if (!childModelName) return;

        childModel = mongoose.model(childModelName);
        childCollectionName = childModel.collection.collectionName;
        childKeys = filter(Object.keys(childModel.schema.tree));

        while (i--) {
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
                as: childPathName
            }
        }, {
            $project: projectObj
        });

        //group
        i = parentKeys.length;
        while (i--) {
            if (parentKeys[i] === childPathName) {
                continue;
            }
            _idGroup[parentKeys[i]] = '$' + parentKeys[i];
        }

        i = childKeys.length;
        while (i--) {
            childGroup[childKeys[i]] = '$' + childPathName + '.' + childKeys[i];
        }

        group._id = _idGroup;
        group[childPathName] = {$push: childGroup};

        //project
        projectObj = {};
        i = parentKeys.length;
        while (i--) {
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
        var i = arr.length;
        while (i--) {
            if (arr[i] == 'id' || arr[i] == '__v') {
                delete arr[i];
            }
        }

        return arr;
    }
};
