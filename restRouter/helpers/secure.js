module.exports = function (Schema) {
    var tree = Schema.tree;
    var keys = Object.keys(tree);
    var options = Schema.options || {};
    var defaultSecureOut = options.defaultSecureOut || 0;
    var defaultSecureIn = options.defaultSecureIn || 0;

    this.exportFilter = function (role, models) {
        var i = keys.length;
        var j = models.length;
        var secureOut;
        var key;

        if (!j) return;

        while (i--) {
            key = keys[i];
            secureOut = tree[key].secureOut || defaultSecureOut;
            if (role < secureOut) {
                while (j--) {
                    delete models[j][key];
                }
            }
        }
    };

    this.importFilter = function (role, model) {
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
