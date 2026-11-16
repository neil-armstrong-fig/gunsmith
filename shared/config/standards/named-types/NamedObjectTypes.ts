import type {Rule} from "eslint";
import {sourceOf} from "@gunsmith/shared/config/standards/source/SourceOf.ts";
import {anonymousObjectTypesOf} from "@gunsmith/shared/config/standards/named-types/anonymous/AnonymousObjectTypesOf.ts";

/** An object type written inline in a signature, a field or a `Record` is given a name in the domain's `types/` folder. */
export const namedObjectTypes: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {named: "Give this object type a name in the domain's types/ folder."},
  },
  create(ruleContext) {
    return {
      "Program:exit"() {
        for (const typeLiteralNode of anonymousObjectTypesOf(sourceOf(ruleContext))) {
          ruleContext.report({
            loc: ruleContext.sourceCode.getLocFromIndex(typeLiteralNode.getStart()),
            messageId: "named",
          });
        }
      },
    };
  },
};
