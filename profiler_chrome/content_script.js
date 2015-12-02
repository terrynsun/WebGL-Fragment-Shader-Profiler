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

var injectProfiler = function() {
    document.getElementById("popup_wrapper").style.visibility = "visible";

    var canvas_list = document.getElementsByTagName("canvas");
    var canvas_message = "";
    if(canvas_list.length > 0) {
        var canvas = canvas_list[0];

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
                console.log(programs[i]);
                if(programs[i] !== undefined)
                $("#programs_options").append("<option value='" + i + "'>" + programs[i] + "</option>");
            }
        }
    } else {
      canvas_message = "This page doesn't have an HTML5 canvas";
    }
    $("#message").text(canvas_message);


    chrome.runtime.sendMessage({
        programs: JSON.stringify(window.localStorage),
        canvas_message: canvas_message
    });
};

$("<div id = 'total_wrapper'><h4 id='profiler_title'>WebGL Fragment Shader Profiler</h4><div id = 'popup_wrapper'><div id ='message'></div><div id ='mousePos'></div><div id ='avg_ms'></div><select id='programs_options'><option value='' disabled selected>Select a shader</option></select></div><button id='injectProfiler'>Profile</button></div>").appendTo("body");
$(document).ready(function() {
    $("#injectProfiler").click(injectProfiler);
});

window.addEventListener('message', function(event) {
    if (event.source !== window) {
        return;
    }
    var message = event.data;

    // Only accept messages that we know are ours
    if (typeof message !== 'object' || message === null ) {
        return;
    }

    chrome.runtime.sendMessage(message);
});

document.addEventListener("avg_ms", function(data) {
    $("#avg_ms").text("Average ms: " +
            Math.round(data.detail.avg_ms * 100) / 100);
    chrome.runtime.sendMessage({ avg_ms: data.detail.avg_ms });
});

document.addEventListener("mouse_pos", function(data) {
    $("#mousePos").text("Pixel: (" + Math.round(data.detail.x) + ", " +
            Math.round(data.detail.y) + ")");
    chrome.runtime.sendMessage({ avg_ms: data.detail.avg_ms });
});
