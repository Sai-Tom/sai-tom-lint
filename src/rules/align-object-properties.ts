import { Rule } from "eslint";

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

interface RuleOptions {
  // 将来的にオプションを追加する場合はここに定義
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Align colons in object literals and interface properties",
      recommended: false,
    },
    fixable: "code",
    schema: [],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const sourceCode = context.getSourceCode();
    const processedNodes = new WeakSet<Rule.Node>();

    return {
      ObjectExpression(node: Rule.Node) {
        processObjectProperties(node);
      },

      TSInterfaceBody(node: Rule.Node) {
        processInterfaceProperties(node);
      },

      TSTypeLiteral(node: Rule.Node) {
        processTypeLiteralProperties(node);
      },
    };

    function processObjectProperties(node: Rule.Node) {
      const objectNode = node as any;
      if (processedNodes.has(node) || objectNode.properties.length < 2) return;
      
      processedNodes.add(node);
      const groups = groupProperties(objectNode.properties);
      
      groups.forEach(group => {
        if (group.length >= 2) {
          checkAndFixGroup(group);
        }
      });
    }

    function processInterfaceProperties(node: Rule.Node) {
      const interfaceNode = node as any;
      if (processedNodes.has(node) || interfaceNode.body.length < 2) return;
      
      processedNodes.add(node);
      const groups = groupProperties(interfaceNode.body);
      
      groups.forEach(group => {
        if (group.length >= 2) {
          checkAndFixGroup(group);
        }
      });
    }

    function processTypeLiteralProperties(node: Rule.Node) {
      const typeNode = node as any;
      if (processedNodes.has(node) || typeNode.members.length < 2) return;
      
      processedNodes.add(node);
      const groups = groupProperties(typeNode.members);
      
      groups.forEach(group => {
        if (group.length >= 2) {
          checkAndFixGroup(group);
        }
      });
    }

    function groupProperties(properties: any[]): any[][] {
      const groups: any[][] = [];
      let currentGroup: any[] = [];
      let lastLine = -1;

      properties.forEach(prop => {
        if (!prop.loc) return;
        
        const currentLine = prop.loc.start.line;
        
        // Skip spread elements, methods, getters/setters, and shorthand properties
        if (prop.type === 'SpreadElement' || 
            prop.method || 
            prop.kind === 'get' || 
            prop.kind === 'set' ||
            (prop.type === 'Property' && prop.shorthand)) {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
            currentGroup = [];
          }
          lastLine = currentLine;
          return;
        }

        // Start new group if there's a blank line
        if (lastLine !== -1 && currentLine - lastLine > 1) {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
            currentGroup = [];
          }
        }

        currentGroup.push(prop);
        lastLine = currentLine;
      });

      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      return groups;
    }

    function checkAndFixGroup(group: any[]) {
      const maxKeyLength = getMaxKeyLength(group);
      
      // Check if alignment is needed
      const needsAlignment = group.some(prop => {
        const keyLength = getKeyLength(prop);
        const spacesBeforeColon = getSpacesBeforeColon(prop);
        // All properties should have at least 1 space before colon
        // Properties shorter than max should have additional spaces for alignment
        const expectedSpaces = maxKeyLength - keyLength + 1;
        return spacesBeforeColon !== expectedSpaces;
      });

      if (needsAlignment) {
        context.report({
          node: group[0],
          loc: {
            start: group[0].loc.start,
            end: group[group.length - 1].loc.end,
          },
          message: "Object properties are not aligned",
          fix(fixer: Rule.RuleFixer) {
            const fixes: Rule.Fix[] = [];

            group.forEach(prop => {
              const keyLength = getKeyLength(prop);
              // Add 1 to ensure at least one space for all properties
              const spacesNeeded = maxKeyLength - keyLength + 1;
              const propFixes = fixProperty(fixer, prop, spacesNeeded);
              if (propFixes) {
                fixes.push(...propFixes);
              }
            });

            return fixes;
          },
        });
      }
    }

    function getKeyLength(prop: any): number {
      if (prop.type === 'Property' || prop.type === 'PropertyDefinition') {
        const key = prop.key;
        if (key.type === 'Identifier') {
          return key.name.length;
        } else if (key.type === 'Literal') {
          return sourceCode.getText(key).length;
        }
      } else if (prop.type === 'TSPropertySignature') {
        const key = prop.key;
        if (key.type === 'Identifier') {
          return key.name.length;
        } else if (key.type === 'Literal') {
          return sourceCode.getText(key).length;
        }
      }
      return 0;
    }

    function getMaxKeyLength(group: any[]): number {
      return Math.max(...group.map(prop => getKeyLength(prop)));
    }

    function getSpacesBeforeColon(prop: any): number {
      const tokens = sourceCode.getTokens(prop);
      const colonToken = tokens.find(token => token.value === ':');
      
      if (!colonToken) return 0;
      
      let keyEndPos: number;
      if (prop.type === 'Property' || prop.type === 'PropertyDefinition') {
        keyEndPos = prop.key.range![1];
      } else if (prop.type === 'TSPropertySignature') {
        keyEndPos = prop.key.range![1];
      } else {
        return 0;
      }
      
      return colonToken.range![0] - keyEndPos;
    }

    function fixProperty(fixer: Rule.RuleFixer, prop: any, spacesNeeded: number): Rule.Fix[] | null {
      const tokens = sourceCode.getTokens(prop);
      const colonToken = tokens.find(token => token.value === ':');
      
      if (!colonToken) return null;

      // Get the key token (identifier or literal)
      let keyEndPos: number;
      if (prop.type === 'Property' || prop.type === 'PropertyDefinition') {
        keyEndPos = prop.key.range![1];
      } else if (prop.type === 'TSPropertySignature') {
        keyEndPos = prop.key.range![1];
      } else {
        return null;
      }

      const fixes: Rule.Fix[] = [];
      
      // Replace spaces before colon with the correct amount
      const rangeStart = keyEndPos;
      const rangeEnd = colonToken.range![0];
      const spaces = ' '.repeat(spacesNeeded);
      fixes.push(fixer.replaceTextRange([rangeStart, rangeEnd], spaces));
      
      // Ensure single space after colon
      const colonEnd = colonToken.range![1];
      const tokenAfterColon = sourceCode.getTokenAfter(colonToken);
      if (tokenAfterColon) {
        const rangeAfterColon = [colonEnd, tokenAfterColon.range![0]] as [number, number];
        if (rangeAfterColon[1] > rangeAfterColon[0]) {
          // There are existing spaces/characters after colon
          fixes.push(fixer.replaceTextRange(rangeAfterColon, ' '));
        } else if (rangeAfterColon[1] === rangeAfterColon[0]) {
          // No space after colon
          fixes.push(fixer.insertTextAfterRange([colonEnd - 1, colonEnd], ' '));
        }
      }
      
      return fixes;
    }
  },
};

export = rule; 