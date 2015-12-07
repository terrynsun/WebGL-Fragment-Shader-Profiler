(function() {
    window.Shaders = {};
    var sym_source  = Symbol("source");
    var sym_type    = Symbol("type");
    var sym_shaders = Symbol("shaders");
    var sym_length  = Symbol("length");
    var sym_name    = Symbol("name");

    var shaderlist  = [];
    var programlist = [];

    var dispatchUpdate = function() {
        var eventObj = new CustomEvent("shaderData", {
                                detail: {
                                },
                            });
        document.dispatchEvent(eventObj);
    };

    var buildName = function(shader) {
        if (window.Editor) {
            var metadata = Editor.checkShader(shader.sym_source);
            return metadata[0] + " (" + metadata[1] + " pragmas, " + metadata[2] + " lines)";
        } else {
            return null;
        }
    };

    Shaders.getName = function(shader) {
        if (shader.sym_name === null) {
            shader.sym_name = buildName(shader);
        }

        if (shader.sym_name === null) {
            return "Unnamed";
        } else {
            return shader.sym_name;
        }
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
            //console.log(frag[0].sym_source);
            return frag[0];
        } else {
            return frag;
        }
    };

    /*
     * Runs when this file is loaded.
     */
    var init = function() {
        var rawShaderSource = WebGLRenderingContext.prototype.shaderSource;
        /*
         * On gl.createShader(), save shader to list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createShader', function(f, type) {
            var shader = f.call(this, type);
            shader.sym_type   = type;
            shader.sym_source = null;
            shader.sym_length = NaN;
            shader.sym_name   = "No Source";

            shaderlist.push(shader);
            dispatchUpdate();
            return shader;
        });

        /*
         * On gl.shaderSource(), attach given source to saved Shader object.
         */
        hijackProto(WebGLRenderingContext.prototype, 'shaderSource', function(f, shader, shaderSource) {
            shader.sym_source = shaderSource;
            shader.sym_length = shaderSource.split('\n').length;
            shader.sym_name   = buildName(shader);

            dispatchUpdate();
            return f.call(this, shader, shaderSource);
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
