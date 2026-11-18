import type {Rule} from "eslint";

/** Plain functions follow every caller; declarations are hoisted, unlike variable initializers. */
export const functionOrder: Rule.RuleModule = {
  meta: {type: "suggestion", schema: [], messages: {order: "Declare {{name}} below its callers."}},
  create(ruleContext) {
    return {
      FunctionDeclaration(node: Rule.Node) {
        if (node.type !== "FunctionDeclaration" || !node.id || !node.range) return;
        if (ruleContext.filename.endsWith(".tsx") && /^[A-Z]/u.test(node.id.name)) return;

        const end = node.range[1];
        const variable = ruleContext.sourceCode.getDeclaredVariables(node).find(value => value.name === node.id?.name);
        if (!variable) return;

        const later = variable.references.some(reference => {
          if (Reflect.get(reference, "isValueReference") === false || !reference.isRead()) return false;

          const identifier = reference.identifier;
          const ancestors = ruleContext.sourceCode.getAncestors(identifier as Rule.Node);
          if (
            ancestors.some(ancestor => ancestor.type === "ExportSpecifier" || String(ancestor.type) === "TSTypeQuery")
          ) {
            return false;
          }

          return identifier.range !== undefined && identifier.range[0] > end;
        });

        if (later) ruleContext.report({node, messageId: "order", data: {name: variable.name}});
      },
    };
  },
};
