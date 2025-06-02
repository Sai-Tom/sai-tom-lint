"use strict";
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const hasRequire = /require\(/;
const spaceMatcher = /(\s*)((?:\+|-|\*|\/|%|&|\^|\||<<|>>|\*\*|>>>)?=)/;
const rule = {
    meta: {
        fixable: "code",
    },
    create(context) {
        const { options } = context;
        const requiresOnly = options && options.length > 0 && options[0].requiresOnly;
        const sourceCode = context.getSourceCode();
        const groups = [];
        let previousNode;
        return {
            VariableDeclaration(node) {
                const source = sourceCode.getText(node);
                if (requiresOnly && !hasRequire.test(source))
                    return;
                addNode(node, node);
            },
            ExpressionStatement(node) {
                // Does it contain an assignment expression?
                const hasAssignmentExpression = node.expression.type === "AssignmentExpression";
                if (!hasAssignmentExpression)
                    return;
                addNode(node, node.expression);
            },
            PropertyDefinition(node) {
                // TypeScript/ES2022 class properties
                const propertyNode = node;
                if (propertyNode.value !== null) {
                    addNode(node, node);
                }
            },
            "Program:exit": checkAll,
        };
        function checkAll() {
            groups.forEach(check);
        }
        function isAssignmentExpression(node) {
            return node.type === "AssignmentExpression";
        }
        function isPropertyDefinition(node) {
            return node.type === "PropertyDefinition";
        }
        function addNode(groupNode, node) {
            if (shouldStartNewGroup(groupNode))
                groups.push([node]);
            else
                getLast(groups).push(node);
            previousNode = groupNode;
        }
        function shouldStartNewGroup(node) {
            // first line of all
            if (!previousNode)
                return true;
            // switching parent nodes
            if (node.parent !== previousNode.parent)
                return true;
            // If previous node was a for and included the declarations, new group
            if (previousNode.parent?.type === "ForStatement" && previousNode.declarations)
                return true;
            // previous line was blank.
            const firstToken = sourceCode.getFirstToken(node);
            const lastToken = sourceCode.getLastToken(previousNode);
            if (!firstToken || !lastToken)
                return true;
            const lineOfNode = firstToken.loc.start.line;
            const lineOfPrev = lastToken.loc.start.line;
            return lineOfNode - lineOfPrev !== 1;
        }
        function check(group) {
            const maxPos = getMaxPos(group);
            if (!areAligned(maxPos, group)) {
                context.report({
                    loc: {
                        start: group[0].loc.start,
                        end: getLast(group).loc.end,
                    },
                    message: "This group of assignments is not aligned",
                    fix: (fixer) => {
                        const fixings = group.map(function (node) {
                            const tokens = sourceCode.getTokens(node);
                            const firstToken = tokens[0];
                            const assignmentToken = tokens.find((token) => ["=", "+=", "-=", "*=", "/=", "%=", "&=", "^=", "|=", "<<=", ">>=", "**=", ">>>="].includes(token.value));
                            const line = sourceCode.getText(node);
                            const lineIsAligned = line.charAt(maxPos) === "=";
                            if (lineIsAligned || !assignmentToken || isMultiline(firstToken, assignmentToken)) {
                                return fixer.replaceText(node, line);
                            }
                            else {
                                // source line may include spaces, we need to accommodate for that.
                                const spacePrefix = firstToken.loc.start.column;
                                const startDelimiter = assignmentToken.loc.start.column - spacePrefix;
                                const endDelimiter = assignmentToken.loc.end.column - spacePrefix;
                                const start = line.slice(0, startDelimiter).replace(/\s+$/m, "");
                                const ending = line.slice(endDelimiter).replace(/^\s+/m, "");
                                const spacesRequired = maxPos - start.length - assignmentToken.value.length + 1;
                                const spaces = " ".repeat(spacesRequired);
                                const fixedText = `${start}${spaces}${assignmentToken.value} ${ending}`;
                                return fixer.replaceText(node, fixedText);
                            }
                        });
                        return fixings.filter((fix) => fix !== null && fix !== undefined);
                    },
                });
            }
        }
        function isMultiline(firstToken, assignmentToken) {
            return firstToken.loc.start.line !== assignmentToken.loc.start.line;
        }
        function findAssigment(node) {
            const prefix = getPrefix(node);
            const source = sourceCode.getText(node);
            const match = source.substring(prefix).match(spaceMatcher);
            const position = match ? match.index + prefix + match[2].length : null;
            return position;
        }
        function getPrefix(node) {
            if (isPropertyDefinition(node)) {
                // For class properties, get the position after the property key
                const propertyNode = node;
                const keyNode = propertyNode.key;
                return keyNode.loc.end.column - keyNode.loc.start.column + keyNode.loc.start.column - node.loc.start.column;
            }
            const nodeBefore = isAssignmentExpression(node)
                ? node.left
                : node.declarations.find((dcl) => dcl.type === "VariableDeclarator").id;
            const prefix = nodeBefore.loc.end.column - nodeBefore.loc.start.column;
            return prefix;
        }
        function areAligned(maxPos, nodes) {
            return nodes
                .filter(assignmentOnFirstLine)
                .map((node) => sourceCode.getText(node))
                .every((source) => source.charAt(maxPos) === "=");
        }
        function getMaxPos(nodes) {
            return nodes
                .filter(assignmentOnFirstLine)
                .map(findAssigment)
                .reduce((last, current) => current !== null ? Math.max(last, current) : last, 0);
        }
        function assignmentOnFirstLine(node) {
            if (isAssignmentExpression(node)) {
                const assignmentNode = node;
                const onFirstLine = assignmentNode.left.loc.start.line === assignmentNode.right.loc.start.line;
                return onFirstLine;
            }
            else {
                const source = sourceCode.getText(node);
                const lines = source.split("\n");
                return lines[0].includes("=");
            }
        }
        function getLast(ary) {
            return ary[ary.length - 1];
        }
    },
};
module.exports = rule;
//# sourceMappingURL=align-assignments.js.map