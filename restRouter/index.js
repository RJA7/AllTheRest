var express = require('express');
var router = express.Router();
var RestHandler = require('./restHandler');

module.exports = function (ModelName) {
    var restHandler = new RestHandler(ModelName);

    router.get('/', restHandler.getItems);
    router.get('/:id', restHandler.getItem);
    router.post('/', restHandler.createItem);
    router.put('/:id', restHandler.changeItem);
    router.delete('/:id', restHandler.deleteItem);

    return router;
};
