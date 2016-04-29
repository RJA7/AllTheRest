var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Min Length rja'],
        maxlength: [32, 'Max length rja']
    },
    age: {
        type: Number,
        required: true
    },
    friends: [{
        type: ObjectId,
        ref: 'user'
    }],
    avatar: {
        type: String
    },
    password: {
        type: String,
        secureIn: 1,
        secureOut: 100
    }
});

UserSchema.options = {
    defaultSortField: '_id',
    defaultLimit: 10,
    filterField: 'name',
    defaultSecureIn: 0,
    defaultSecureOut: 0,
    init: function (model) {console.log('init model'); },
    validate: function (model, isNew) {console.log(isNew); }
};

module.exports = mongoose.model('user', UserSchema);
