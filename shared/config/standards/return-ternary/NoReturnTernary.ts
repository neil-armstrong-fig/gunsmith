import type {Rule} from "eslint";

/** A function returns early with an `if` instead of returning a conditional expression. */
export const noReturnTernary: Rule.RuleModule = {
  meta: {type: "suggestion", schema: [], messages: {early: "Return early instead of returning a ternary."}},
  create(ruleContext) {
    return {
      "ReturnStatement > ConditionalExpression"(node: Rule.Node) {
        ruleContext.report({node, messageId: "early"});
      },
    };
  },
};
