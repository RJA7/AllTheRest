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
        secureOut: 100
    }
});

UserSchema.options = {
    defaultSortField: '_id',
    defaultLimit: 10,
    defaultSecureIn: 0,
    defaultSecureOut: 0,
    filterField: 'age',                //string
    searchFields: ['name', 'age'],       //array or string
    init: function (req) {console.log('get files and save or change req.params.id...'); },
    validate: function (model, isNew) {console.log(isNew + ' validate if you want'); }
};

module.exports = mongoose.model('user', UserSchema);
