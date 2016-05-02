module.exports = function (Schema) {
    var tree = Schema.tree;
    var keys = Object.keys(tree);
    var options = Schema.options || {};
    var defaultSecureOut = options.defaultSecureOut || 0;
    var defaultSecureIn = options.defaultSecureIn || 0;

    this.exportFilter = function (req, models) {
        var user = req.user || {};
        var role = user.role || 0;
        var i = keys.length;
        var secureOut;
        var key;
        var j;

        while (i--) {
            key = keys[i];
            secureOut = tree[key].secureOut || defaultSecureOut;
            if (role < secureOut) {
                j = models.length;
                while (j--) {
                    delete models[j][key];
                }
            }
        }
    };

    this.importFilter = function (req, model) {
        var user = req.user || {};
        var role = user.role || 0;
        var i = keys.length;
        var secureIn;
        var key;

        while (i--) {
            key = keys[i];
            secureIn = tree[key].secureIn || defaultSecureIn;
            if (role < secureIn) {
                delete model[key];
            }
        }
    };
};
