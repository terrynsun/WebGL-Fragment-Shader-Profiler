/*
 * WebGL timing using EXT_disjoint_timer_query. If the extension can't be found,
 * it will send random data instead.
 *
 * Chrome extension - this is injected into a WebGL application.
 *
 * Terry Sun, Sally Kong
 */
(function() {
    'use strict';

    window.TimerExt = {};

    var gl;
    var glTimer = null;
    var currentQuery = null;
    var isRunning = false;

    var totalCount = 0;
    var totalElapsed = 0;

    var enabled = true;
    var sendEvent = true;

    TimerExt.init = function(_gl) {
        gl = _gl;
        glTimer = gl.getExtension('EXT_disjoint_timer_query');
        if (glTimer === null) {
            dispatchDummyEvent();
        }
    };

    TimerExt.enable = function() {
        enabled = true;
    };

    TimerExt.disable = function() {
        enabled = false;
    };

    /*
     * Starts a timer query (if one isn't running AND one isn't waiting for data
     * to be returned).
     */
    TimerExt.start = function() {
        // If timing currently disabled or glTimer does not exist, exit early.
        if (enabled === false || glTimer === null) {
            return;
        }
        if (currentQuery === null) {
            currentQuery = glTimer.createQueryEXT();
            glTimer.beginQueryEXT(glTimer.TIME_ELAPSED_EXT, currentQuery);
            isRunning = true;
        }
    };

    TimerExt.reset = function() {
        currentQuery = null;
        isRunning = false;
        totalCount = 0;
        totalElapsed = 0;
    };

    var pollQueryData = function(query) {
        var available = glTimer.getQueryObjectEXT(query, glTimer.QUERY_RESULT_AVAILABLE_EXT);
        var disjoint = gl.getParameter(glTimer.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
            return glTimer.getQueryObjectEXT(currentQuery, glTimer.QUERY_RESULT_EXT);
        } else {
            return null;
        }
    };

    var dispatchDummyEvent = function() {
        function dummy() {
            totalCount += 25;
            dispatchEvent(Math.random(), count, "timer-ext-dummy");
            setTimeout(dummy, 1000);
        }
        dummy();
    };

    var dispatchEvent = function(_avg_ms, _count, _source) {
        if (sendEvent === false) {
            return;
        }

        var eventObj = new CustomEvent("timingData", {
                                detail: {
                                    avg_ms: _avg_ms,
                                    count: _count,
                                    source: _source,
                                    time: new Date(),
                                },
                            });
        document.dispatchEvent(eventObj);
    };

    /*
     * Ends a timer query (if running) and polls for timing information (if
     * query exists to be polled).
     */
    TimerExt.end = function() {
        // If timing currently disabled or glTimer does not exist, exit early.
        if (enabled === false || glTimer === null) {
            return;
        }

        // End currently running query
        if (isRunning === true) {
            glTimer.endQueryEXT(glTimer.TIME_ELAPSED_EXT);
        }

        // If there's a waiting query, poll glTimer for data.
        if (currentQuery !== null) {
            var timeElapsed = pollQueryData(currentQuery);
            if (timeElapsed !== null) {
                totalCount += 1;
                totalElapsed += timeElapsed;
                currentQuery = null;
                if (totalCount % 25 === 0) {
                    var avg_ms = totalElapsed/totalCount * 0.000001;
                    dispatchEvent(avg_ms, totalCount, "timer-ext");
                }
            }
        }
    };
})();
