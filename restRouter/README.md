npm i rest-router

How to use:

//routes

var restRouter = require('rest-router');

app.use('/users', restRouter('user'));      // where user is name of mongo model


//models

var UserSchema = Schema({

    name: {type: String},

    age: {type: Number},

    friends: [{

        type: ObjectId,

        ref: 'user'

    }],

    avatar: {type: String},

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

    //calling before create, update or change model. Use it for save file. model = req.body;
    init: function (model) {console.log('init model'); },

    //calling before create, update or change model.
    validate: function (model, isNew) {console.log(isNew); }

};

module.exports = mongoose.model('user', UserSchema);


And now you can use:

localhost/users?expand=friends&filter=someUserName&sort=age&order=-1&skip=2&limit=2

Also module provide secure for record and read models.

role = req.user.role || 0;

if path has secureIn or secureOut upper then user role, it have being deleted
