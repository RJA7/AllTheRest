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
        set: function (pass) {
            return pass; //crypt
        },
        secureIn: 1,
        secureOut: 100
    }
});

UserSchema.options = {
    defaultSortField: '_id',
    defaultLimit: 2,
    filterField: 'name',
    defaultSecureIn: 0,
    defaultSecureOut: 0,

    files: [{path: 'avatar', uploadPath: './public/images/', width: 100, height: 100}]
};

module.exports = mongoose.model('user', UserSchema);
