/*
 * This script is injected into the webpage and starts up the profiler.
 */
(function() {
    var programSelector = $("#programSelect");

    var mousePos;
    var programs;

    var updateShaders = function() {
        programs = Shaders.getPrograms();
        programSelector.css("visibility", "visible");
        programSelector.empty();
        programSelector.append("<option value='' disabled selected>Select a shader</option>");
        for (var i = 0; i < programs.length; i++) {
            programSelector.append("<option value='" + i + "'>" + programs[i] + "</option>");
        }
    };

    var init = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        var canvas = canvas_list[0];
        var gl = canvas.getContext('webgl');

        ProfilerExt.init(gl);
        mousePos = [0, 0];

        // Mouse movement listener: update mousePos and write to screen
        canvas.addEventListener('mousemove', function(evt) {
            var rect = canvas.getBoundingClientRect();
            mousePos[0] = evt.clientX - rect.left;
            mousePos[1] = evt.clientY - rect.top;
            ProfilerExt.mouse(mousePos);
        }, false);

        document.addEventListener("timingData", function(data) {
            var msg = "Average frame: " +
                    Math.round(data.detail.avg_ms * 100) / 100 + " ms" +
                    "<br>Source: " + data.detail.source;
            $("#divTiming").html(msg);
        });

        document.addEventListener("shaderData", function(data) {
            updateShaders();
        });

        updateShaders();

        $("#profileButton").click(function() {
            var idx = Number(programSelector.val());
            var program = programs[idx];
            var fs = Shaders.getFragShader(program);
            if (fs !== null) {
                ProfilerExt.setShader(program);
                ProfilerExt.setEnabled(true);
                ProfilerExt.reset();
            }
            $("divMessage").html("Selected shader.");
            $("divTiming").html("Waiting for data...");
        });
    };
    init();
})();
