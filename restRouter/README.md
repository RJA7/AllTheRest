npm i rest-router

How to use:
<pre>
//routes
var restRouter = require('rest-router');
app.use('/users', restRouter('user'));      // where user is name of mongoose Model


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

//All attributes are optional
UserSchema.options = {
    defaultSortField: '_id',
    defaultLimit: 10,
    defaultSecureIn: 0,
    defaultSecureOut: 0,
    filterField: 'age',                     //string
    searchFields: ['name', 'age'],          //array or string

    //calling before get, create, update or change model.
    init: function (req) {req.params.id = req.session.user._id; },

    //calling before create, update or change model. model = req.body;
    validate: function (model, isNew) {console.log(isNew); }
};

module.exports = mongoose.model('user', UserSchema);


</pre>

<pre>
And now you can use:
localhost/users?expand=friends&filter=someUserName&
            sortfield=age&sortorder=-1&skip=2&limit=10&search=nameAge

1. expand=friends&expand=otherObjectIdField

2. filter=someValue - filter by single field specified in schema options

3. sort, skip, limit to paginate your view
    When you request collection in first (index 0) it element will be
    attribute totalCount.

4. search=nameage - searching in all model's fields specified in options

5. Also module provide secure for record and read models.
    secureIn and secureOut in model path attributes
    if path has secureIn or secureOut upper than user role,
    it have being deleted.
    role = req.user.role || 0;
</pre>
