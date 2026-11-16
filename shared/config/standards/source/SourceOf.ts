import ts from "typescript";
import type {Rule} from "eslint";
import {scriptKindOf} from "@gunsmith/shared/config/standards/source/script-kind/ScriptKindOf.ts";

/** The TypeScript syntax tree of the file ESLint is checking, with parent links, for the rules that read types ESLint's own tree does not give them. */
export function sourceOf(ruleContext: Rule.RuleContext): ts.SourceFile {
  return ts.createSourceFile(
    ruleContext.filename,
    ruleContext.sourceCode.text,
    ts.ScriptTarget.Latest,
    true,
    scriptKindOf(ruleContext.filename),
  );
}
