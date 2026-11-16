import type {Rule} from "eslint";
import {sourceOf} from "@gunsmith/shared/config/standards/source/SourceOf.ts";
import {extraExportOf} from "@gunsmith/shared/config/standards/single-export/extra-export/ExtraExportOf.ts";

/** A file exports one subject: its name is the file's name. */
export const singleExport: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {single: "Export one subject per file; move unrelated exports into their own subject files."},
  },
  create(ruleContext) {
    return {
      "Program:exit"() {
        const statement = extraExportOf(sourceOf(ruleContext));
        if (!statement) {
          return;
        }

        ruleContext.report({loc: ruleContext.sourceCode.getLocFromIndex(statement.getStart()), messageId: "single"});
      },
    };
  },
};
