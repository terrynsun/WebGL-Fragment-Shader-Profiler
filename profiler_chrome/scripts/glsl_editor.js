(function() {
    'use strict';

    var parser;

    var rgxStart = /#pragma profile start ([0-9])*/;
    var rgxEnd   = /#pragma profile end ([0-9])*/;

    var rgxVec   = /vec[1-4]/;

    window.Editor = {};

    Editor.init = function() {
        parser = new GLSLParser();
    };

    /*
     * In a given node list, replace all declaration statements between #pragma
     * markup with no-ops.
     *
     * TODO: return more than one modified list?
     */
    var processNodeList = function(nodelist) {
        var variations = [];
        var regex = rgxStart;
        var inPragma = false;
        for (var i = 0; i < nodelist.length; i++) {
            var node = nodelist[i];
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
                processNodeList(funcNodeStmts);
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
                    }
                } else if (initializer.nodeName == "Constructor") {
                }
            }
        }
    };

    /*
     * Take in shader code and output modified shader code.
     * Really just a wrapper to generate/handle ASTs.
     */
    Editor.editShader = function(fsSource) {
        var ast = parser.parse(fsSource);
        var astDecls = ast.declarations;
        processNodeList(astDecls);
        return parser.printAST(ast);
    };

    Editor.naiveModifyFragmentShader = function(fs, modifier) {
        var fsLines = fs.split('\n');
        var remove = false;
        var regexStart = /\/\/\/ START (\d)/;
        var regexEnd = /\/\/\/ END (\d)/;
        for (var i = 0; i < fsLines.length; i++) {
            var line = fsLines[i];

            var resultStart = line.match(regexStart);
            if (resultStart !== null && resultStart.length == 2) {
                if (modifier != resultStart[1]) {
                    remove = true;
                }
            }

            if (remove === true) {
                fsLines[i] = "";
                var resultStop = line.match(regexEnd);
                if (resultStop && resultStop.length == 2) {
                    if (modifier != resultStop[1]) {
                        remove = false;
                    }
                }
            }
        }
        return fsLines.join('\n');
    };
})();
