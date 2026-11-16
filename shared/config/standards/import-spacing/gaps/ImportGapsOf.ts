import ts from "typescript";
import type {ImportGap} from "@gunsmith/shared/config/standards/import-spacing/gaps/types/ImportGap.ts";

const BLANK_LINE = /\n[ \t]*\n/;
const COMMENTS = /\/\/.*|\/\*[\s\S]*?\*\//g;

/**
 * Every gap after an import that breaks the spacing rule, with the whitespace that would mend it; a gap that holds a
 * comment or code has no replacement, since only a person can decide what to do with that. Between two imports there
 * is no blank line and no code (comments may stay); after the last import there is exactly one blank line.
 */
export function importGapsOf(sourceFile: ts.SourceFile): ImportGap[] {
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  const gaps: ImportGap[] = [];
  for (const [index, declaration] of imports.entries()) {
    const gap = gapAfter(sourceFile, declaration, imports[index + 1]);
    if (gap) {
      gaps.push(gap);
    }
  }

  return gaps;
}

/** The gap after `declaration`, or `undefined` when it is as it should be. `nextImport` is absent after the last import. */
function gapAfter(
  sourceFile: ts.SourceFile,
  declaration: ts.ImportDeclaration,
  nextImport: ts.ImportDeclaration | undefined,
): ImportGap | undefined {
  const next = nextImport ?? sourceFile.statements[sourceFile.statements.indexOf(declaration) + 1];
  if (!next) {
    return undefined;
  }

  const start = declaration.end;
  const end = next.getStart(sourceFile);
  const between = sourceFile.text.slice(start, end);
  const isLastImport = nextImport === undefined;
  if (!isLastImport && between.replace(COMMENTS, "").trim() !== "") {
    return {start, end};
  }

  if (BLANK_LINE.test(between) === isLastImport) {
    return undefined;
  }

  if (between.trim() !== "") {
    return {start, end};
  }

  return {start, end, replacement: whitespaceAfter(isLastImport)};
}

function whitespaceAfter(isLastImport: boolean): string {
  if (isLastImport) {
    return "\n\n";
  }

  return "\n";
}
