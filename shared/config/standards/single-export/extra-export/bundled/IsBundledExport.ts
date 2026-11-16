import ts from "typescript";

/** Whether one statement exports several things at once: `export const a = 1, b = 2`, `export {a, b}` or `export * from`. */
export function isBundledExport(statement: ts.Statement): boolean {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.length > 1;
  }
  if (!ts.isExportDeclaration(statement)) {
    return false;
  }

  const exportClause = statement.exportClause;
  if (!exportClause) {
    return true;
  }
  if (!ts.isNamedExports(exportClause)) {
    return false;
  }

  return exportClause.elements.length > 1;
}
