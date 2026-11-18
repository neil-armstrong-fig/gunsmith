import type {Rule} from "eslint";

/** Module-level helpers use hoisted declarations; nested helpers remain expressions. */
export const helperFunctionDeclaration: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {declaration: "Use a function declaration for helper {{name}}, below its callers."},
  },
  create(ruleContext) {
    return {
      VariableDeclarator(node: Rule.Node) {
        if (node.type !== "VariableDeclarator" || node.id.type !== "Identifier" || !node.init) return;
        if (node.init.type !== "ArrowFunctionExpression" && node.init.type !== "FunctionExpression") return;
        if (node.parent.type !== "VariableDeclaration" || node.parent.kind !== "const") return;

        const ancestors = ruleContext.sourceCode.getAncestors(node);
        if (
          ancestors.some(ancestor => {
            return (
              ancestor.type === "FunctionDeclaration" ||
              ancestor.type === "FunctionExpression" ||
              ancestor.type === "ArrowFunctionExpression"
            );
          })
        ) {
          return;
        }

        if (ancestors.at(-2)?.type === "ExportNamedDeclaration") return;

        if (ruleContext.filename.endsWith(".tsx") && /^[A-Z]/u.test(node.id.name)) return;

        ruleContext.report({node, messageId: "declaration", data: {name: node.id.name}});
      },
    };
  },
};
