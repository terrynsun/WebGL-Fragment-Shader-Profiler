/*
 * This script is injected into the webpage and starts up the profiler.
 */
(function() {
    var programSelector = $("#programSelect");

    var mousePos;        // [x,y] array
    var programs;        // list
    var running = false; // boolean

    var updateShaders = function() {
        programs = Shaders.getPrograms();
        programSelector.css("visibility", "visible");
        programSelector.empty();
        programSelector.append("<option value='' disabled selected>Select a shader</option>");
        for (var i = 0; i < programs.length; i++) {
            var prog = programs[i];
            var fs = Shaders.getFragShader(prog);
            var name = Shaders.getName(fs);
            programSelector.append("<option value='" + i + "'>" + name + "</option>");
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

        // "timingData" event: update timing output div.
        document.addEventListener("timingData", function(data) {
            var msg = "Average frame: " +
                    Math.round(data.detail.avg_ms * 100) / 100 + " ms" +
                    "<br>Source: " + data.detail.source;
            $("#divTiming").html(msg);
        });

        // "timingData" event: update dropdown list of shaders.
        document.addEventListener("shaderData", function(data) {
            updateShaders();
        });

        updateShaders();

        // clicked "profileButton": shader has been selected, update and start Profiler
        $("#profileButton").click(function() {
            if (running === false) {
                var idx = Number(programSelector.val());
                var program = programs[idx];
                var fs = Shaders.getFragShader(program);
                if (fs !== null) {
                    ProfilerExt.setScissor($("#optMouse").prop('checked'));
                    ProfilerExt.setProgram(program);
                    ProfilerExt.setEnabled(true);
                    ProfilerExt.reset();
                }
                $("divMessage").html("Selected shader.");
                $("divTiming").html("Waiting for data...");
            } else {
                ProfilerExt.setScissor(false);
                ProfilerExt.setProgram(null);
                ProfilerExt.setEnabled(false);
                ProfilerExt.reset();
            }
            running = !running;
        });
    };
    init();
})();
