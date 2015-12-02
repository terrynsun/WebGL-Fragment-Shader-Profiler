(function() {
    var canvas;

    var getMousePos = function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var dispatchEvent = function(mouse_pos) {
        var eventObj = new CustomEvent("mouse_pos", {
                                detail: {
                                    x: mouse_pos.x,
                                    y: mouse_pos.y,
                                    time: new Date(),
                                },
                            });
        document.dispatchEvent(eventObj);
    };

    document.addEventListener("timingData", function(data) {
        var msg = "Average frame: " +
                Math.round(data.detail.avg_ms * 100) / 100 + " ms" +
                "<br>Source: " + data.detail.source;
        $("#avg_ms").html(msg);
    });

    document.addEventListener("mouse_pos", function(data) {
        $("#mousePos").text("Pixel: (" + Math.round(data.detail.x) + ", " +
                Math.round(data.detail.y) + ")");
    });

    var getCanvas = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        if (canvas_list.length > 0) {
            return canvas_list[0];
        } else {
            return null;
        }
    };

    var initUI = function() {
        $("<div id = 'total_wrapper'><h4 id='profiler_title'>WebGL Fragment Shader Profiler</h4><div id = 'popup_wrapper'><div id ='message'></div><div id ='mousePos'></div><div id ='avg_ms'></div><select id='programs_options'><option value='' disabled selected>Select a shader</option></select></div><button id='profileButton'>Profile</button></div>").appendTo("body");
        document.getElementById("popup_wrapper").style.visibility = "visible";
        $("#avg_ms").html("Waiting for timing data...");

        // Mouse movement listener: update mousePos and write to screen
        canvas.addEventListener('mousemove', function(evt) {
            var mousePos = getMousePos(canvas, evt);
            dispatchEvent(mousePos);
        }, false);

        document.getElementById("programs_options").style.visibility = "visible";
        if(Object.keys(localStorage).length > 0) {
            programs = window.localStorage;
            $("#programs_options").empty();
            $("#programs_options").append("<option value='' disabled selected>Select a shader</option>");
            for (var i = 1; i <= Object.keys(programs).length; i++) {
                // console.log(programs[i]);
                if(programs[i] !== undefined)
                $("#programs_options").append("<option value='" + i + "'>" + programs[i] + "</option>");
            }
        }
    };

    var injectScript = function(file) {
        var s = document.createElement('script');
        s.src = chrome.extension.getURL(file);
        s.onload = function() {
            //this.parentNode.removeChild(this);
        };
        (document.head || document.documentElement).appendChild(s);
    };

    var init = function() {
        canvas = getCanvas();
        if (canvas !== null) {
            var scripts = [ 'scripts/timer_ext.js', 'scripts/profiler_ext.js', 'scripts/injected.js' ];

            for (var i = 0; i < scripts.length; i++) {
                injectScript(scripts[i]);
            }

            $(document).ready(initUI);
        }
    };

    init();
})();
