/*
 * A WebGL Profiler framework.
 *
 * Chrome extension - this is injected into a WebGL application.
 *
 * Terry Sun, Sally Kong
 */
(function() {
    window.ProfilerExt = {};

    // Enable overwriting of gl scissor with mouse box.
    var enableScissorTest = false;

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

    // Intersect two scissor boxes in one coordinate only.
    var intersect = function(orig, orig_len, other, other_len) {
        if (other < orig) {
            var tmpA = other;
            var tmpLen = other_len;
            other = orig;
            other_len = orig_len;
            orig = tmpA;
            orig_len = tmpLen;
        }

        if (other >= orig && other <= orig + orig_len) {
            // Intersection of the two boxes
            var sc = other;
            var sc_len = Math.min(orig + orig_len - other, other_len);
            return [sc, sc_len];
        } else {
            // No intersection
            return [other, 0];
        }
    };

    ProfilerExt.init = function(gl) {
        TimerExt.init(gl);
        hijack(gl, 'drawArrays', function(f, mode, first, count) {
            TimerExt.start();
            var ret = f(mode, first, count);
            TimerExt.end();
            return ret;
        });
    };
})();
