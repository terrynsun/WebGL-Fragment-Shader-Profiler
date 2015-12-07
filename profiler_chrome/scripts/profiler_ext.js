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

    // Keep track of current program and its variants
    var program = null;
    var variants = null;

    // Profiling Data

    // -1 indicates original program
    var variantIdx;
    var curVariant;
    // Array of arrays, [ time, count ]
    var timingData;

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
        curProgram = program;
        if (program !== null) {
            variants = Shaders.getProgramVariants(program);
            variantIdx = -1;
            timingData = [];
            for (var i = -1; i < variants.length; i++) {
                timingData.push([0, 0]);
            }
        }
    };

    ProfilerExt.nextVariant = function() {
        variantIdx++;
        if (variantIdx === variants.length) {
            variantIdx = -1;
        }
        if (variantIdx === -1) {
            curVariant = program;
        } else {
            curVariant = variants[variantIdx];
        }
    };

    ProfilerExt.logData = function(data) {
        // account for original variant == -1
        var save = timingData[variantIdx+1];
        save[0] += data.elapsed;
        save[1] += data.interval;
        //ProfilerExt.nextVariant();
    };

    var formatTime = function(ns, count) {
        ns = ns / count;
        var ms = ns * 1e-6;
        if (ms < 0.1) {
            var us = ns * 1e-3;
            return sprintf("%.3f %s", us, "µs");
        } else {
            return sprintf("%.3f %s", ms, "ms");
        }
    };

    ProfilerExt.getString = function() {
        var msg;
        msg = "Timing:";
        msg += "<br>";
        if (timingData.length === 1) {
            msg += sprintf("%s (%d)", formatTime(timingData[0][0], timingData[0][1]), timingData[0][1]);
        } else {
            msg += sprintf("Original: %s (%d)", formatTime(timingData[0][0], timingData[0][1]), timingData[0][1]);
            msg += "<br>";
            for (var i = 1; i < timingData.length; i++) {
                var variantData = timingData[i];
                msg += sprintf("Variant #%d: %s (%d)", i,
                               formatTime(variantData[0], variantData[1]), variantData[1]);
                msg += "<br>";
            }
        }
        return msg;
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

    var copyUniforms = function() {
        var activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        console.log(activeUniforms);
        for (var i=0; i < activeUniforms; i++) {
            var uniform = gl.getActiveUniform(program, i);
        }
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
                var drawProg = curVariant || program;
                if (drawProg !== program) {
                    copyUniforms();
                    gl.useProgram(drawProg);
                }
                TimerExt.start();
                var ret = f(mode, first, count);
                TimerExt.end();
                if (drawProg !== program) {
                    //resetUniforms();
                    gl.useProgram(program);
                }
                return ret;
            }
        });
    };
})();
