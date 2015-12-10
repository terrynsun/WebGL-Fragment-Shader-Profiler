(function() {
    'use strict';

    var parser = new GLSLParser();

    var rgxStart = /#pragma profile start ([0-9]*)/;
    var rgxEnd   = /#pragma profile end ([0-9]*)/;
    var rgxName  = /#pragma name (\w*)/;

    var rgxVec   = /vec[1-4]/;

    window.Editor = {};

    /*
     * In a given node list, replace all declaration statements between #pragma
     * markup with no-ops.
     *
     * TODO: return more than one modified list?
     */
    var processNodeList = function(original, inPragma) {
        var variations = [];
        var regex = rgxStart;
        for (var i = 0; i < original.length; i++) {
            var node = original[i];
            var name = node.nodeName;
            if (name === "PreprocessorDirective" && node.content.match(regex)) {
                inPragma = !inPragma;
                if (inPragma) {
                    regex = rgxEnd;
                } else {
                    regex = rgxStart;
                }
            } else if (name === "FunctionDefinition") {
                // Recurse into function definitions.
                var funcNodeStmts = node.body.statementList;
                processNodeList(funcNodeStmts, inPragma);
            } else if (inPragma === true && name === "DeclarationStatement") {
                var type = node.declaration.typeSpecifier.dataType[0].toLowerCase();

                var decl = node.declaration.declarators[0];
                var initializer = decl.initializer;
                var varName = decl.name;

                if (initializer.nodeName == "FunctionCall") {
                    var func = initializer.name;
                    if (type.match(rgxVec)) {
                        var newDecl = sprintf("%s %s = %s(0);", type, varName, type);
                        var newNode = parser.parse(newDecl).declarations[0];
                        node.declaration = newNode;
                        console.log(newDecl);
                    }
                } else if (initializer.nodeName == "Constructor") {
                }
            }
        }
        return original;
    };

    /*
     * Take in shader code. Returns array:
     *   [0]: shader name, if given by #pragma name <name>, or "Unnamed"
     *   [1]: number of #pragma profile start/end sections.
     *   [2]: number of lines
     *   [3]: an error message, if any.
     */
    Editor.checkShader = function(fsSource) {
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
     * Take in shader code and output modified shader code.
     * Really just a wrapper to generate/handle ASTs.
     */
    Editor.editShader = function(fsSource) {
        var ast = parser.parse(fsSource);
        var astDecls = ast.declarations;
        processNodeList(astDecls, false);
        return parser.printAST(ast);
    };
})();
