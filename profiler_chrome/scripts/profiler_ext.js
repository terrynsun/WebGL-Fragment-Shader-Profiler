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
    var enableTiming      = false;
    var mousePos = [0, 0];
    var program = null;

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

    ProfilerExt.setScissor = function(bool) {
        enableScissorTest = bool;
    };

    ProfilerExt.setProgram = function(_program) {
        program = _program;
    };

    ProfilerExt.setEnabled = function(bool) {
        enableTiming = bool;
        if (bool === false) {
            program = null;
        }
    };

    ProfilerExt.reset = function() {
        TimerExt.reset();
    };

    ProfilerExt.mouse = function(_mouse) {
        mousePos = _mouse;
    };

    ProfilerExt.init = function(gl) {
        if (gl === null) {
            return;
        }
        TimerExt.init(gl);
        hijack(gl, 'drawArrays', function(f, mode, first, count) {
            if (enableTiming === false) {
                return f(mode, first, count);
            }
            if (gl.getParameter(gl.CURRENT_PROGRAM) !== program) {
                return f(mode, first, count);
            }
            if (enableScissorTest) {
                // Store previous state to restore at the end of this function
                var prevScissorEnabled = gl.getParameter(gl.SCISSOR_TEST);
                var prevSB = gl.getParameter(gl.SCISSOR_BOX);

                var scSize = 50;
                // Find current mouse state
                var mouseSB = [Math.round(mousePos[0] - scSize/2),
                        Math.round(gl.drawingBufferHeight - mousePos[1] - scSize/2),
                        scSize, scSize];
                var sb = mouseSB;

                // If gl.scissor already being used, use intersection of the
                // two scissor boxes
                if (prevScissorEnabled) {
                    var sbX = intersect(prevSB[0], prevSB[2], mouseSB[0], mouseSB[2]);
                    var sbY = intersect(prevSB[1], prevSB[3], mouseSB[1], mouseSB[3]);
                    sb = [sbX[0], sbY[0], sbX[1], sbY[1]];
                } else {
                    gl.enable(gl.SCISSOR_TEST);
                }

                // Set scissor.
                gl.scissor(sb[0], sb[1], sb[2], sb[3]);

                // Draw, but inject Timer calls.
                TimerExt.start();
                var ret = f(mode, first, count);
                TimerExt.end();

                // Reset previous state
                if (!prevScissorEnabled) {
                    gl.disable(gl.SCISSOR_TEST);
                }
                gl.scissor(prevSB[0], prevSB[1], prevSB[2], prevSB[3]);

                // Return value from drawArrays
                return ret;
            } else {
                // Draw as normal, but inject Timer calls
                TimerExt.start();
                var ret = f(mode, first, count);
                TimerExt.end();
                return ret;
            }
        });
    };
})();
