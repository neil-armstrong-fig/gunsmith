import ts from "typescript";
import {isLocalProps} from "@gunsmith/shared/config/standards/named-types/anonymous/boundary/props/IsLocalProps.ts";

/** Whether an inline object type is in a place that needs a name: a parameter, a field, a return type or a `Record`'s value. The right-hand side of a type alias is already a name, and a component's own `Props` is exempt. */
export function needsName(typeLiteralNode: ts.TypeLiteralNode, filename: string): boolean {
  if (isLocalProps(typeLiteralNode, filename)) {
    return false;
  }

  for (let parent = typeLiteralNode.parent; parent; parent = parent.parent) {
    if (ts.isTypeAliasDeclaration(parent)) {
      return false;
    }

    if (ts.isParameter(parent) || ts.isPropertySignature(parent) || ts.isPropertyDeclaration(parent)) {
      return true;
    }

    if (
      ts.isFunctionLike(parent) &&
      parent.type &&
      typeLiteralNode.pos >= parent.type.pos &&
      typeLiteralNode.end <= parent.type.end
    ) {
      return true;
    }

    if (ts.isTypeReferenceNode(parent) && ts.isIdentifier(parent.typeName) && parent.typeName.text === "Record") {
      return true;
    }
  }
  return false;
}
