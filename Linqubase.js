var mongoose = require('mongoose');
var User = require('./models/users');

mongoose.connect('mongodb://127.0.0.1:27017/rest');

clear();
setTimeout(fill, 1000);

function clear() {
    User.remove({}, function () {
        console.log('Users removed');
    });
}

function fill() {
    var user;
    var friends = [];

    for (var i = 0; i < 100; i++) {
        user = new User();
        user.name = 'namer' + i;
        user.age = i;
        user.friends = friends;
        user.save();
        friends.push(user);
    }
    console.log('Users created');
}
