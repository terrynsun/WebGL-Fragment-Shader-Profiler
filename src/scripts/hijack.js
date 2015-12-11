// Overwrite a GL function.
var hijack = function(that, name, wrap) {
    var f0 = that[name];
    that[name] = function() {
        var f = function() {
            f0.apply(that, arguments);
        };
        var args = Array.prototype.slice.call(arguments);
        args.unshift(f);
        return wrap.apply(null, args);
    };
};

var hijackProto = function(proto, name, wrap) {
    var f0 = proto[name];
    proto[name] = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(f0);
        return wrap.apply(this, args);
    };
};
