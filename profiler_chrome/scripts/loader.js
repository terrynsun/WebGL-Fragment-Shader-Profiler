(function() {
    var injectScript = function(file) {
        var s = document.createElement('script');
        s.src = chrome.extension.getURL(file);
        s.onload = function() {
            this.parentNode.removeChild(this);
        };
        (document.head || document.documentElement).appendChild(s);
    };

    var initUI = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        if (canvas_list.length > 0) {
            $("<div id = 'total_wrapper'><h4 id='profiler_title'>WebGL Fragment Shader Profiler</h4><div id = 'popup_wrapper'><div id ='message'></div><div id ='mousePos'></div><div id ='avg_ms'></div><select id='programs_options'><option value='' selected>Select a shader</option></select></div><button id='profileButton'>Profile</button></div>").appendTo("body");
            document.getElementById("popup_wrapper").style.visibility = "visible";
            $("#avg_ms").html("Waiting for timing data...");

            var scripts = [ 'scripts/timer_ext.js', 'scripts/profiler_ext.js', 'scripts/main.js' ];

            for (var j = 0; j < scripts.length; j++) {
                injectScript(scripts[j]);
            }
        }
    };

    var init = function() {
        injectScript("scripts/hijack.js");
        injectScript("scripts/shaders.js");
        $(document).ready(initUI);
    };

    init();
})();
