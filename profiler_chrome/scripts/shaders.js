(function() {
    window.Shaders = {};
    // Shader properties
    var sym_source  = Symbol("source");
    var sym_type    = Symbol("type");
    var sym_length  = Symbol("length");
    var sym_name    = Symbol("name");
    var sym_num_variants = Symbol("num_variants");

    // Program properties
    var sym_shaders  = Symbol("shaders");
    var sym_fs       = Symbol("fs");

    // Applies to both Shader and Program
    var sym_variants = Symbol("variants");
    var sym_is_variant = Symbol("is_variant");
    var sym_built   = Symbol("built");

    // GL object lists
    var shaderlist  = [];
    var programlist = [];

    // Store original GL functions
    var rawCreateShader,  rawShaderSource;
    var rawCreateProgram, rawAttachShader;

    // Store a GL context to build programs into.
    // TODO: is this necessary?
    var gl;

    /*************************************************************************
     * Accessors
     *************************************************************************/
    Shaders.setGL = function(_gl) {
        gl = _gl;
    };

    Shaders.getPrograms = function() {
        return programlist;
    };

    Shaders.getSource = function(shader) {
        return shader.sym_source;
    };

    Shaders.getProgramVariants = function(program) {
        return program.sym_variants;
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
            return frag[0];
        } else {
            // TODO: handle multiple shaders?
            return frag[0];
        }
    };

    /*************************************************************************
     * Set shader properties (internal)
     *************************************************************************/
    /*
     * Take in shader code. Returns array:
     *   [0]: shader name, if given by #pragma name <name>, or "Unnamed"
     *   [1]: number of #pragma profile start/end sections.
     *   [2]: number of lines
     *   [3]: an error message, if any.
     */
    var checkShader = function(fsSource) {
        var rgxStart = /#pragma profile start ([0-9]*)/;
        var rgxEnd   = /#pragma profile end ([0-9]*)/;
        var rgxName  = /#pragma name (\w*)/;

        var lines = fsSource.split('\n');
        var name = "Unnamed";
        var pragmaCountStart = 0;
        var pragmaCountEnd = 0;
        var error = "";
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var nameMatch = line.match(rgxName);
            if (line.match(rgxStart)) {
                pragmaCountStart++;
            } else if (line.match(rgxEnd)) {
                pragmaCountEnd++;
            } else if (nameMatch) {
                if (name !== "") {
                    error += "multiple #pragma profile <name>";
                }
                name = nameMatch[1];
            }
        }
        if (pragmaCountStart !== pragmaCountEnd) {
            error += "pragma sections are incorrectly defined.";
        }
        return [name, pragmaCountStart, lines.length, error];
    };
    /*
     * If Editor exists, check source for some metadata and, if applicable,
     * build shaderSource variants.)
     *
     * (Editor may not be loaded yet when first shaderSource calls are made.)
     */
    var setMetadata = function(shader) {
        var metadata = checkShader(shader.sym_source);
        shader.sym_name = metadata[0] + " (" + metadata[1] + " variants, " + metadata[2] + " lines)";
        shader.num_variants = metadata[1];
    };

    Shaders.getName = function(shader) {
        if (shader.sym_name === "Unnamed Shader") {
            setMetadata(shader);
        }

        if (shader.sym_name === null) {
            return "Unnamed";
        } else {
            return shader.sym_name;
        }
    };

    /*************************************************************************
     * Generate variants
     *************************************************************************/
    var compileShaderVariant = function(source, origName) {
        if (gl !== undefined) {
            var shader = rawCreateShader.call(gl, gl.FRAGMENT_SHADER);
            rawShaderSource.call(gl, shader, source);

            shader.sym_source = source;
            shader.sym_is_variant = true;
            shader.sym_name = origName + " [1]";
            shader.sym_length = source.split('\n').length;
            shader.sym_type = gl.FRAGMENT_SHADER;

            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(shader.sym_source);
            }
            return shader;
        }
    };

    var compileProgramVariant = function(shaders, idx) {
        if (gl !== undefined) {
            var program = rawCreateProgram.call(gl);
            for (var i = 0; i < shaders.length; i++) {
                rawAttachShader.call(gl, program, shaders[i]);
            }
            gl.linkProgram(program);

            program.sym_shaders = shaders;
            program.sym_is_variant = true;
            program.sym_uniforms = {};
            program.sym_name = idx;

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Linker error");
            }
            return program;
        }
    };

    Shaders.buildVariants = function(program) {
        if (window.Editor === undefined || program.sym_built === true) {
            return;
        }

        var fs = Shaders.getFragShader(program);
        program.sym_name = fs.sym_name;

        var fsIdx = program.sym_shaders.indexOf(fs);
        var shadersLists = [];
        if (fs !== null && fs.num_variants > 0) {
            var newSource = Editor.editShader(fs.sym_source);
            console.log(newSource);
            var shaderVariant = compileShaderVariant(newSource, fs.sym_name);
            fs.sym_variants.push(shaderVariant);

            var newList = program.sym_shaders.slice(0);
            newList[fsIdx] = shaderVariant;

            shadersLists.push(newList);
        }
        // TODO: remove this
        // Inserts another copy of the original source.
        var newSource = fs.sym_source;
        var shaderVariant = compileShaderVariant(newSource, fs.sym_name);
        fs.sym_variants.push(shaderVariant);

        var newList = program.sym_shaders.slice(0);
        newList[fsIdx] = shaderVariant;

        shadersLists.push(newList);
        for (var i = 0; i < shadersLists.length; i++) {
            var programVariant = compileProgramVariant(shadersLists[i], i);
            program.sym_variants.push(programVariant);
        }
        program.sym_built = true;
    };

    /*************************************************************************
     * Shader Update Event
     *************************************************************************/
    var dispatchUpdate = function() {
        var eventObj = new CustomEvent("shaderData", {
                                detail: {
                                },
                            });
        document.dispatchEvent(eventObj);
    };

    /*
     * Runs when this file is loaded -- does WebGLRenderingContext hijacking.
     */
    var init = function() {
        rawCreateShader  = WebGLRenderingContext.prototype.createShader;
        rawShaderSource  = WebGLRenderingContext.prototype.shaderSource;
        rawCreateProgram = WebGLRenderingContext.prototype.createProgram;
        rawAttachShader  = WebGLRenderingContext.prototype.attachShader;

        /*
         * On gl.createShader(), save shader to list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createShader', function(f, type) {
            var shader = f.call(this, type);
            shader.sym_type   = type;
            shader.sym_source = null;
            shader.sym_length = NaN;
            shader.sym_name   = "No Source";
            shader.sym_built  = false;
            shader.sym_variants = [];

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
            if (shader.sym_type == WebGLRenderingContext.FRAGMENT_SHADER) {
                shader.sym_name = "Unnamed Fragment Shader";
            } else {
                shader.sym_name = "Unnamed Vertex Shader";
            }
            shader.sym_built  = false;
            setMetadata(shader, shaderSource);

            dispatchUpdate();
            return f.call(this, shader, shaderSource);
        });

        /* gl.compileShader not hijacked.  */

        /*
         * On gl.createProgram(), save program to internal list.
         */
        hijackProto(WebGLRenderingContext.prototype, 'createProgram', function(f) {
            var program = f.call(this);
            program.sym_shaders  = [];
            program.sym_variants = [];
            program.sym_built = false;
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
            program.sym_built = false;
            if (shader.sym_type == WebGLRenderingContext.FRAGMENT_SHADER) {
                program.sym_fs = shader;
                program.sym_name = shader.sym_name;
            }
            dispatchUpdate();
            return retval;
        });

        /* gl.linkProgram not hijacked.  */

        hijackProto(WebGLRenderingContext.prototype, 'activeTexture', function(f, texture) {
            var prog = this.getParameter(this.CURRENT_PROGRAM);
            var variants = prog.sym_variants;
            for (var i = 0; i < variants.length; i++) {
                this.useProgram(variants[i]);
                f.call(this, texture);
            }
            this.useProgram(prog);
            return f.call(this, texture);
        });

        hijackProto(WebGLRenderingContext.prototype, 'bindTexture', function(f, target, texture) {
            var prog = this.getParameter(this.CURRENT_PROGRAM);
            var variants = prog.sym_variants;
            for (var i = 0; i < variants.length; i++) {
                this.useProgram(variants[i]);
                f.call(this, target, texture);
            }
            this.useProgram(prog);
            return f.call(this, target, texture);
        });

        WebGLRenderingContext.prototype.rawGetUniformLocation =
            WebGLRenderingContext.prototype.getUniformLocation;

        hijackProto(WebGLRenderingContext.prototype, 'getUniformLocation', function(f, program, name) {
            var variants = program.sym_variants;
            for (var i = 0; i < variants.length; i++) {
                var variant = variants[i];
                var loc = f.call(this, variant, name);
                variant.sym_uniforms[name] = loc;
            }

            var location = f.call(this, program, name);
            if (location !== null) {
                location.sym_name = name;
            }
            return location;
        });

        var uniformFunctions = [
            '1f', '2f', '3f', '4f',
            '1i', '2i', '3i', '4i',
            '1fv', '2fv', '3fv', '4fv',
            '1iv', '2iv', '3iv', '4iv',
        ];

        for (var i = 0; i < uniformFunctions.length; i++) {
            var func = 'uniform' + uniformFunctions[i];
            hijackProto(WebGLRenderingContext.prototype, func, function(f, location) {
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                if (location === null) {
                    return f.apply(this, args);
                }

                var prog = this.getParameter(this.CURRENT_PROGRAM);
                var variants = prog.sym_variants;
                var name = location.sym_name;
                for (var i = 0; i < variants.length; i++) {
                    var variant = variants[i];
                    this.useProgram(variant);
                    var variantLoc = variant.sym_uniforms[name];
                    if (variantLoc === undefined) {
                        variantLoc = this.rawGetUniformLocation(variant, name);
                        variant.sym_uniforms[name] = variantLoc;
                    }
                    args[0] = variantLoc;
                    f.apply(this, args);
                }

                this.useProgram(prog);
                args[0] = location;
                return f.apply(this, args);
            });
        }
    };
    init();
})();
