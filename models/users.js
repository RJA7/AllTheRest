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
    }]
});

UserSchema.options = {
    defaultSortField: '_id',
    defaultLimit: 2,
    filterField: 'name'
};

module.exports = mongoose.model('user', UserSchema);
