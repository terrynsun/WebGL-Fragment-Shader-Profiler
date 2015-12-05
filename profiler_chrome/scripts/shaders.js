(function() {
    window.Shaders = {};
    var sym_source  = Symbol("source");
    var sym_type    = Symbol("type");
    var sym_shaders = Symbol("shaders");
    var sym_length  = Symbol("length");

    var shaderlist  = [];
    var programlist = [];

    var dispatchUpdate = function() {
        var eventObj = new CustomEvent("shaderData", {
                                detail: {
                                },
                            });
        document.dispatchEvent(eventObj);
    };

    Shaders.getName = function(shader) {
        var name = "Unamed";
        var length = "";
        if (!isNaN(shader.sym_length)) {
            length = shader.sym_length;
        }
        return name + " (" + length + " lines)";
    };

    Shaders.getPrograms = function() {
        return programlist;
    };

    Shaders.getFragShader = function(program) {
        var shaders = program.sym_shaders;
        var frag = [];
        for (var i = 0; i < shaders.length; i++) {
            if (shaders[i].sym_type == WebGLRenderingContext.FRAGMENT_SHADER) {
                frag.push(shaders[i]);
            }
        }

        if (frag.length === 0) {
            return null;
        } else if (frag.length === 1) {
            console.log(frag[0].sym_source);
            return frag[0];
        } else {
            return frag;
        }
    };

    /*
     * Runs when this file is loaded.
     */
    var init = function() {
        /*
         * On gl.createShader(), save shader to list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createShader', function(f, type) {
            var shader = f.call(this, type);
            shader.sym_type   = type;
            shader.sym_source = null;
            shader.sym_length = NaN;

            shaderlist.push(shader);
            dispatchUpdate();
            return shader;
        });

        /*
         * On gl.shaderSource(), attach given source to saved Shader object.
         */
        hijackProto(WebGLRenderingContext.prototype, 'shaderSource', function(f, shader, shaderSource) {
            var retval = f.call(this, shader, shaderSource);
            shader.sym_source = shaderSource;
            shader.sym_length = shaderSource.split('\n').length;
            // TODO: run through GLSL Editor, create different versions,
            // possibly extract name and other metadata
            dispatchUpdate();
            return retval;
        });

        /* gl.compileShader not hijacked.  */

        /*
         * On gl.createProgram(), save program to internal list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createProgram', function(f) {
            var program = f.call(this);
            program.sym_shaders = [];
            programlist.push(program);
            dispatchUpdate();
            return program;
        });

        /*
         * On gl.attachShader(), attach given shader to saved Program object.
         */
        hijackProto(WebGLRenderingContext.prototype, 'attachShader', function(f, program, shader) {
            var retval = f.call(this, program, shader);
            program.sym_shaders.push(shader);
            dispatchUpdate();
            return retval;
        });

        /* gl.linkProgram not hijacked.  */
    };
    init();
})();
