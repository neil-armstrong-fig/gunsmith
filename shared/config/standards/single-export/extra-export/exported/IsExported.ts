import ts from "typescript";

/** Whether the statement is an export of any kind. */
export function isExported(statement: ts.Statement): boolean {
  if (ts.isExportDeclaration(statement) || ts.isExportAssignment(statement)) {
    return true;
  }
  if (!ts.canHaveModifiers(statement)) {
    return false;
  }

  return ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) === true;
}
