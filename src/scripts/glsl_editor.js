(function() {
    'use strict';

    var parser = new GLSLParser();

    var rgxStart = /#pragma profile start ([0-9]*)/;
    var rgxEnd   = /#pragma profile end ([0-9]*)/;
    var rgxName  = /#pragma name (\w*)/;

    var rgxVec   = /vec[1-4]/;
    var rgxDecl  = /^(\w*) (\w*) = (.*)/;
    var rgxAssn  = /^(\w*) [+-/\*]?= (.*)/;

    var rgxTexture2D = /(.*) [+-\/\*]?= texture2D\((.*)\)(.*)/;

    window.Editor = {};

    var processLines = function(source, disableTexture2D) {
        var lines = source.split("\n");
        var regex = rgxStart;
        var varDict = {};
        var inPragma = false;
        var injected_dummy = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.match(regex)) {
                inPragma = !inPragma;
                if (inPragma) {
                    regex = rgxEnd;
                } else {
                    regex = rgxStart;
                }
            }

            if(disableTexture2D) {
                var matchTexture2D = line.match(rgxTexture2D);
                if(matchTexture2D) {
                    var type_name = matchTexture2D[1];
                    var ending = matchTexture2D[3];
                    var newLine = sprintf("%s = vec4(0)%s", type_name, ending);
                    lines[i] = newLine;
                } 
            } else {

                var matchDecl = line.match(rgxDecl);
                if (matchDecl) {
                    var type = matchDecl[1];
                    var name = matchDecl[2];
                    varDict[name] = type;
                    if (inPragma === true) {
                        var newDecl = sprintf("%s %s = %s(0);", type, name, type);
                        lines[i] = newDecl;
                    }
                    continue;
                }

                var matchAssn = line.match(rgxAssn);
                if (matchAssn) {
                    var name = matchAssn[1];
                    if (inPragma === true) {
                        var type = varDict[name];
                        if (type !== undefined && type.match(rgxVec)) {
                            var newDecl = sprintf("%s = %s(0);", name, type);
                            lines[i] = newDecl;
                        } else if (type !== undefined && type === "float") {
                            var newDecl = sprintf("%s = 0.0;", name, type);
                            lines[i] = newDecl;
                        }
                    }
                    continue;
                }
            }
        }
        return lines.join("\n");
    };

    /*
     * Take in shader code and output modified shader code.
     * Really just a wrapper to generate/handle ASTs.
     */
    Editor.editShader = function(fsSource, disableTexture2D) {
        return processLines(fsSource, disableTexture2D);
    };

})();
