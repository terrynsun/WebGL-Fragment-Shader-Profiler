/*
 * This script is injected into the webpage and starts up the profiler.
 */
(function() {
    var canvas;
    var gl;

    var mousePos;

    var init = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        canvas = canvas_list[0];
        gl = canvas.getContext('webgl');
        ProfilerExt.init(gl);
        mousePos = [0, 0];

        // Mouse movement listener: update mousePos and write to screen
        canvas.addEventListener('mousemove', function(evt) {
            var rect = canvas.getBoundingClientRect();
            mousePos[0] = evt.clientX - rect.left;
            mousePos[1] = evt.clientY - rect.top;
            ProfilerExt.mouse(mousePos);
//            $("#mousePos").text("Pixel: (" + Math.round(mousePos[0]) + ", " +
//                    Math.round(mousePos[1]) + ")");
        }, false);

        document.addEventListener("timingData", function(data) {
            var msg = "Average frame: " +
                    Math.round(data.detail.avg_ms * 100) / 100 + " ms" +
                    "<br>Source: " + data.detail.source;
            $("#avg_ms").html(msg);
        });

        document.addEventListener("shaderData", function(data) {
            var programs = Shaders.getPrograms();
            $("#programs_options").css("visibility", "visible");
            $("#programs_options").empty();
            $("#programs_options").append("<option value='' disabled selected>Select a shader</option>");
            for (var i = 0; i < programs.length; i++) {
                $("#programs_options").append("<option value='" + i + "'>" + programs[i] + "</option>");
            }
        });
    };
    init();
})();
