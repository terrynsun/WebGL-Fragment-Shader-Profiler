(function() {
    var injectScript = function(file, p) {
        var insertNode = function(f) {
            return new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = chrome.extension.getURL(f);
                s.onload = function() {
                    this.parentNode.removeChild(this);
                    resolve();
                };
                (document.head || document.documentElement).appendChild(s);
            });
        };
        return p.then(insertNode(file));
    };

    var initUI = function() {
        var canvas_list = document.getElementsByTagName("canvas");
        if (canvas_list.length > 0) {
            var popup = chrome.extension.getURL("popup.html");
            $.get(popup, function(data) {
                $(data).appendTo("body");
                $("#toggle_img").attr('src',chrome.extension.getURL("icon.png"));
                var gl = canvas_list[0].getContext('webgl');
                if (gl.getExtension('EXT_disjoint_timer_query') === null) {
                    $("#divMessage").html("You need the WebGL Extension: EXT_disjoint_timer_query to profile");
                    $("#popup_wrapper").css("display", "none");
                } else {
                    $("#popup_wrapper").css("display", "block");
                    $("#divMessage").html("Please select a shader to begin!");
                }

                    var scripts = [
                        'lib/jquery.min.js',
                        'lib/sprintf.js',
                        'scripts/timer_ext.js',
                        'scripts/profiler_ext.js',
                        'scripts/glsl_editor.js',
                        'scripts/main.js' ];

                    var p = new Promise(function(resolve) { resolve(); });
                    for (var j = 0; j < scripts.length; j++) {
                        p = injectScript(scripts[j], p);
                    }
            });
        }

    };

    var init = function() {
        var scripts = [
            'lib/glsl_parser.js',
            "scripts/hijack.js",
            "scripts/shaders.js"
        ];

        var p = new Promise(function(resolve) { resolve(); });
        for (var j = 0; j < scripts.length; j++) {
            p = injectScript(scripts[j], p);
        }
        $(document).ready(initUI);
    };

    init();
})();
