import ts from "typescript";
import {referencesValue} from "@gunsmith/shared/config/standards/single-export/extra-export/derived/references/ReferencesValue.ts";

/** Whether the exports are one value and only the types read off it with `typeof`. */
export function isValueWithDerivedTypes(statements: readonly ts.Statement[]): boolean {
  const variables = statements.filter(ts.isVariableStatement);
  if (variables.length !== 1) {
    return false;
  }

  const declaration = variables[0]?.declarationList.declarations[0];
  if (!declaration || !ts.isIdentifier(declaration.name)) {
    return false;
  }

  const valueName = declaration.name.text;
  const aliases = statements.filter(ts.isTypeAliasDeclaration);
  return aliases.length + 1 === statements.length && aliases.every(alias => referencesValue(alias.type, valueName));
}
