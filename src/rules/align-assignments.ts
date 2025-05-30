import { Rule } from "eslint";

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const hasRequire = /require\(/;
const spaceMatcher = /(\s*)((?:\+|-|\*|\/|%|&|\^|\||<<|>>|\*\*|>>>)?=)/;

interface RuleOptions {
  requiresOnly?: boolean;
}

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const { options } = context;
    const requiresOnly = options && options.length > 0 && (options[0] as RuleOptions).requiresOnly;
    const sourceCode = context.getSourceCode();
    const groups: Rule.Node[][] = [];
    let previousNode: Rule.Node | undefined;

    return {
      VariableDeclaration(node: Rule.Node) {
        const source = sourceCode.getText(node);
        if (requiresOnly && !hasRequire.test(source)) return;

        addNode(node, node);
      },

      ExpressionStatement(node: Rule.Node) {
        // Does it contain an assignment expression?
        const hasAssignmentExpression = (node as any).expression.type === "AssignmentExpression";
        if (!hasAssignmentExpression) return;

        addNode(node, (node as any).expression);
      },

      PropertyDefinition(node: Rule.Node) {
        // TypeScript/ES2022 class properties
        const propertyNode = node as any;
        if (propertyNode.value !== null) {
          addNode(node, node);
        }
      },

      "Program:exit": checkAll,
    };

    function checkAll(): void {
      groups.forEach(check);
    }

    function isAssignmentExpression(node: Rule.Node): boolean {
      return node.type === "AssignmentExpression";
    }

    function isPropertyDefinition(node: Rule.Node): boolean {
      return node.type === "PropertyDefinition";
    }

    function addNode(groupNode: Rule.Node, node: Rule.Node): void {
      if (shouldStartNewGroup(groupNode)) groups.push([node]);
      else getLast(groups).push(node);

      previousNode = groupNode;
    }

    function shouldStartNewGroup(node: Rule.Node): boolean {
      // first line of all
      if (!previousNode) return true;

      // switching parent nodes
      if (node.parent !== previousNode.parent) return true;

      // If previous node was a for and included the declarations, new group
      if (previousNode.parent?.type === "ForStatement" && (previousNode as any).declarations) return true;

      // previous line was blank.
      const firstToken = sourceCode.getFirstToken(node);
      const lastToken = sourceCode.getLastToken(previousNode);
      if (!firstToken || !lastToken) return true;
      
      const lineOfNode = firstToken.loc!.start.line;
      const lineOfPrev = lastToken.loc!.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    function check(group: Rule.Node[]): void {
      const maxPos = getMaxPos(group);

      if (!areAligned(maxPos, group)) {
        context.report({
          loc: {
            start: group[0].loc!.start,
            end: getLast(group).loc!.end,
          },
          message: "This group of assignments is not aligned",
          fix: (fixer: Rule.RuleFixer) => {
            const fixings = group.map(function (node) {
              const tokens = sourceCode.getTokens(node);
              const firstToken = tokens[0];
              const assignmentToken = tokens.find((token: any) => 
                ["=", "+=", "-=", "*=", "/=", "%=", "&=", "^=", "|=", "<<=", ">>=", "**=", ">>>="].includes(token.value)
              );
              const line = sourceCode.getText(node);
              const lineIsAligned = line.charAt(maxPos) === "=";
              
              if (lineIsAligned || !assignmentToken || isMultiline(firstToken, assignmentToken)) {
                return fixer.replaceText(node, line);
              } else {
                // source line may include spaces, we need to accommodate for that.
                const spacePrefix = firstToken.loc!.start.column;
                const startDelimiter = assignmentToken.loc!.start.column - spacePrefix;
                const endDelimiter = assignmentToken.loc!.end.column - spacePrefix;
                const start = line.slice(0, startDelimiter).replace(/\s+$/m, "");
                const ending = line.slice(endDelimiter).replace(/^\s+/m, "");
                const spacesRequired = maxPos - start.length - assignmentToken.value.length + 1;
                const spaces = " ".repeat(spacesRequired);
                const fixedText = `${start}${spaces}${assignmentToken.value} ${ending}`;
                return fixer.replaceText(node, fixedText);
              }
            });

            return fixings.filter((fix): fix is Rule.Fix => fix !== null && fix !== undefined);
          },
        });
      }
    }

    function isMultiline(firstToken: any, assignmentToken: any): boolean {
      return firstToken.loc!.start.line !== assignmentToken.loc!.start.line;
    }

    function findAssigment(node: Rule.Node): number | null {
      const prefix = getPrefix(node);
      const source = sourceCode.getText(node);
      const match = source.substring(prefix).match(spaceMatcher);
      const position = match ? match.index! + prefix + match[2].length : null;
      return position;
    }

    function getPrefix(node: Rule.Node): number {
      if (isPropertyDefinition(node)) {
        // For class properties, get the position after the property key
        const propertyNode = node as any;
        const keyNode = propertyNode.key;
        return keyNode.loc!.end.column - keyNode.loc!.start.column + keyNode.loc!.start.column - node.loc!.start.column;
      }
      
      const nodeBefore = isAssignmentExpression(node) 
        ? (node as any).left 
        : (node as any).declarations.find((dcl: any) => dcl.type === "VariableDeclarator").id;

      const prefix = nodeBefore.loc!.end.column - nodeBefore.loc!.start.column;
      return prefix;
    }

    function areAligned(maxPos: number, nodes: Rule.Node[]): boolean {
      return nodes
        .filter(assignmentOnFirstLine)
        .map((node) => sourceCode.getText(node))
        .every((source) => source.charAt(maxPos) === "=");
    }

    function getMaxPos(nodes: Rule.Node[]): number {
      return nodes
        .filter(assignmentOnFirstLine)
        .map(findAssigment)
        .reduce((last: number, current: number | null) => 
          current !== null ? Math.max(last, current) : last, 0);
    }

    function assignmentOnFirstLine(node: Rule.Node): boolean {
      if (isAssignmentExpression(node)) {
        const assignmentNode = node as any;
        const onFirstLine = assignmentNode.left.loc!.start.line === assignmentNode.right.loc!.start.line;
        return onFirstLine;
      } else {
        const source = sourceCode.getText(node);
        const lines = source.split("\n");
        return lines[0].includes("=");
      }
    }

    function getLast<T>(ary: T[]): T {
      return ary[ary.length - 1];
    }
  },
};

export = rule; 