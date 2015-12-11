(function() {
    'use strict';

    var parser = new GLSLParser();

    var rgxStart = /#pragma profile start ([0-9]*)/;
    var rgxEnd   = /#pragma profile end ([0-9]*)/;
    var rgxName  = /#pragma name (\w*)/;

    var rgxVec   = /vec[1-4]/;
    var rgxDecl  = /^(\w*) (\w*) = (.*)/;
    var rgxAssn  = /^(\w*) [+-/\*]?= (.*)/;

    window.Editor = {};

    /*
     * In a given node list, replace all declaration statements between #pragma
     * markup with no-ops.
     *
     * TODO: return more than one modified list?
     */
    var processNodeList = function(original, inPragma, varDict) {
        var variations = [];
        var regex = rgxStart;
        var variables = varDict || {};
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
            } else if (name === "FunctionDefinition" || name === "ForStatement") {
                // Recurse into function definitions.
                var funcNodeStmts = node.body.statementList;
                processNodeList(funcNodeStmts, inPragma);
            } else if (name === "IfStatement") {
                // Recurse into function definitions.
                var ifStmts = node.consequent.statementList;
                processNodeList(ifStmts, inPragma);
                if (node.alternate !== null) {
                    var elseStmts = node.consequent.statementList;
                    processNodeList(elseStmts, inPragma);
                }
            }

            if (name === "DeclarationStatement") {
                var type = node.declaration.typeSpecifier.dataType[0].toLowerCase();

                var decl = node.declaration.declarators[0];
                var varName = decl.name;

                if (variables[varName] === undefined) {
                    variables[varName] = type;
                }

                if (inPragma === true && type.match(rgxVec)) {
                    var newDecl = sprintf("%s %s = %s(1);", type, varName, type);
                    var newNode = parser.parse(newDecl).declarations[0];
                    node.declaration = newNode;
                }
            } else if (name === "ExpressionStatement") {
                //console.log(node);
                var varName = node.expression.left.name;

                var type = variables[varName];

                if (inPragma === true && type !== undefined && type.match(rgxVec)) {
                    var newDecl = sprintf("%s %s = %s(1);", type, varName, type);
                    var newNode = parser.parse(newDecl).declarations[0];
                    //node.expression.right.declaration = newNode;
                    console.log(node.expression.right);
                    console.log(newNode);
                    console.log(parser.printAST(node));
                }
            }
        }
        return original;
    };

    var processLines = function(source) {
        var lines = source.split("\n");
        var regex = rgxStart;
        var varDict = {};
        var inPragma = false;
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
        return lines.join("\n");
    };

    /*
     * Take in shader code and output modified shader code.
     * Really just a wrapper to generate/handle ASTs.
     */
    Editor.editShader = function(fsSource) {
        return processLines(fsSource);
        //var fsLines = fsSource.split("\n");
        //var ast = parser.parse(fsSource);
        //var astDecls = ast.declarations;
        //processNodeList(astDecls, false);
        //return parser.printAST(ast);
    };
})();
