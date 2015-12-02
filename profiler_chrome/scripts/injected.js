/*
 * This script is injected into the webpage and starts up the profiler.
 */
(function() {
    var canvas_list = document.getElementsByTagName("canvas");
    var canvas = canvas_list[0];
    var gl = canvas.getContext('webgl');
    ProfilerExt.init(gl);
})();
