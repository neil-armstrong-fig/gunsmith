import type {Rule} from "eslint";
import {sourceOf} from "@gunsmith/shared/config/standards/source/SourceOf.ts";
import {importGapsOf} from "@gunsmith/shared/config/standards/import-spacing/gaps/ImportGapsOf.ts";

/** Imports sit together with no blank line between them, then one blank line before the first line of code. */
export const importSpacing: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    schema: [],
    messages: {spacing: "Keep imports contiguous, then leave one blank line before code."},
  },
  create(ruleContext) {
    return {
      Program() {
        for (const importGap of importGapsOf(sourceOf(ruleContext))) {
          ruleContext.report({
            loc: ruleContext.sourceCode.getLocFromIndex(importGap.end),
            messageId: "spacing",
            fix(fixer) {
              // ESLint's SDK requires null when no safe whitespace fix is available.
              if (importGap.replacement === undefined) {
                return null;
              }

              return fixer.replaceTextRange([importGap.start, importGap.end], importGap.replacement);
            },
          });
        }
      },
    };
  },
};
