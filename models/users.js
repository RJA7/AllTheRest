var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Min Length rja'],
        maxlength: [32, 'Max length rja'],
        filter: true
    },
    age: {
        type: Number,
        required: true,
        filter: true
    },
    friend: [{
        type: ObjectId,
        ref: 'user'
    }]
});

module.exports = mongoose.model('user', UserSchema);
