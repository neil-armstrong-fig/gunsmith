import ts from "typescript";
import {nodesIn} from "@gunsmith/shared/config/standards/source/nodes/NodesIn.ts";

/** Whether the exports are one class and only the interfaces that class uses. */
export function isClassWithInterfaces(statements: readonly ts.Statement[]): boolean {
  const classes = statements.filter(ts.isClassDeclaration);
  if (classes.length !== 1) {
    return false;
  }

  const classDeclaration = classes[0];
  if (!classDeclaration) {
    return false;
  }

  const interfaceDeclarations = statements.filter(ts.isInterfaceDeclaration);
  if (interfaceDeclarations.length + 1 !== statements.length) {
    return false;
  }

  const identifiers = new Set(
    [...nodesIn(classDeclaration)].flatMap(node => {
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        return [node.typeName.text];
      }
      if (ts.isExpressionWithTypeArguments(node) && ts.isIdentifier(node.expression)) {
        return [node.expression.text];
      }

      return [];
    }),
  );
  return interfaceDeclarations.every(declaration => identifiers.has(declaration.name.text));
}
