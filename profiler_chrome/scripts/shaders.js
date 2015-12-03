(function() {
    window.Shaders = {};
    var sym_source  = Symbol("source");
    var sym_type    = Symbol("type");
    var sym_shaders = Symbol("shaders");

    var shaderlist  = [];
    var programlist = [];

    /*
     * Runs when this file is loaded.
     */
    var init = function() {
        /*
         * On gl.createShader(), save shader to list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createShader', function(f, type) {
            var shader = f.call(this, type);
            shader.sym_type = type;
            shaderlist.push(shader);
            return shader;
        });

        /*
         * On gl.shaderSource(), attach given source to saved Shader object.
         */
        hijackProto(WebGLRenderingContext.prototype, 'shaderSource', function(f, shader, shaderSource) {
            var retval = f.call(this, shader, shaderSource);
            shader.sym_source = shaderSource;
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
            return program;
        });

        /*
         * On gl.attachShader(), attach given shader to saved Program object.
         */
        hijackProto(WebGLRenderingContext.prototype, 'attachShader', function(f, program, shader) {
            var retval = f.call(this, program, shader);
            program.sym_shaders.push(shader);
            console.log(program.sym_shaders);
            return retval;
        });

        /* gl.linkProgram not hijacked.  */
    };
    init();
})();
