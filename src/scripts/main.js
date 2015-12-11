/*
 * This script is injected into the webpage and starts up the profiler.
 */
(function() {
    var programSelector = $("#programSelect");

    var mousePos;        // [x,y] array
    var programs;        // list
    var running = false; // boolean
    var profiler_display = false;

    var updateShaders = function() {
        programs = Shaders.getPrograms();
        programSelector.css("visibility", "visible");
        programSelector.empty();
        programSelector.append("<option value='' disabled selected>Select a shader</option>");
        for (var i = 0; i < programs.length; i++) {
            var prog = programs[i];
            var fs = Shaders.getFragShader(prog);
            var name = "Null Shader?";
            if (fs === null) {
            } else if (fs.length && fs.length > 1) {
                name = "Multiple Shaders";
            } else {
                name = Shaders.getName(fs);
            }
            programSelector.append("<option value='" + i + "'>" + name + "</option>");
        }
    };

    var init = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        var canvas = canvas_list[0];
        var gl = canvas.getContext('webgl');

        ProfilerExt.init(gl);
        Shaders.setGL(gl);
        mousePos = [0, 0];

        // Mouse movement listener: update mousePos and write to screen
        canvas.addEventListener('mousemove', function(evt) {
            var rect = canvas.getBoundingClientRect();
            mousePos[0] = evt.clientX - rect.left;
            mousePos[1] = evt.clientY - rect.top;
            ProfilerExt.mouse(mousePos);
            var msg = sprintf("Pixel (%.0f, %.0f)", mousePos[0], mousePos[1]);
            $("#current_pixel").html(msg);
        }, false);

        // "timingData" event: update timing output div.
        document.addEventListener("timingData", function(data) {
            ProfilerExt.logData(data.detail);
            var msg = ProfilerExt.getString();

            $("#divTiming").html(msg);
        });

        // "timingData" event: update dropdown list of shaders.
        document.addEventListener("shaderData", function(data) {
            updateShaders();
        });

        updateShaders();

        $("#toggle_icon").click(function() {
            $(this).toggleClass("display");
            $("#total_wrapper").toggleClass("display");
            $("#popupBody").toggleClass("display");
            $("#profilerTitle").toggleClass("display");
            $("#divMessage").toggleClass("display");
        });

        $("#programSelect").change(function() {
                var selected = programSelector.val();
                if (selected === null) {
                    $("#divPreview").html("");
                    return;
                }
                var idx = Number(selected);

                var program = programs[idx];
                var fs = Shaders.getFragShader(program);
                var source = Shaders.getSource(fs);
                source = source.split("\n").join("<br>");
                source = source.split(" ").join("&nbsp;");
                $("#divPreview").html(source);
        });

        // clicked "profileButton": shader has been selected, update and start Profiler
        $("#profileButton").click(function() {
            if (running === false) {
                // Choose program and start running
                var selected = programSelector.val();
                if (selected === null) {
                    $("#divMessage").text("Not a valid shader.");
                    return;
                }
                var idx = Number(selected);

                var program = programs[idx];
                var fs = Shaders.getFragShader(program);
                if (fs !== null) {
                    var disable_texture2D = $("#optTexture2D").prop('checked');
                    console.log(disable_texture2D);
                    Shaders.buildVariants(program, disable_texture2D);
                    var scissor = $("#optMouse").prop('checked');
                    ProfilerExt.enable(program, scissor);
                }

                // Update text
                $("#divMessage").html("Profiling: " + $("#programSelect option:selected").text());
                $("#divTiming").html("Waiting for data...");
                $("#profileButton").text("End");
            } else {
                // Stop Profiler
                ProfilerExt.disable();

                // Update text
                $("#divMessage").html("Select a shader to begin!");
                $("#profileButton").text("Start");
            }
            running = !running;
        });
    };
    init();
})();
