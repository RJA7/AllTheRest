module.exports = function (Schema) {
    var tree = Schema.tree;
    var options = Schema.options || {};
    var defaultSecureOut = options.defaultSecureOut || 0;

    this.exportFilter = function (role, models) {
        var keys = Object.keys(tree);
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

    this.importFilter = function () {

    };
};
