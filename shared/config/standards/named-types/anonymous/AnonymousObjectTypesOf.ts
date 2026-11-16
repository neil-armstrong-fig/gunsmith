import ts from "typescript";
import {nodesIn} from "@gunsmith/shared/config/standards/source/nodes/NodesIn.ts";
import {needsName} from "@gunsmith/shared/config/standards/named-types/anonymous/boundary/NeedsName.ts";

/** The inline object types in a file that should have a name. */
export function anonymousObjectTypesOf(sourceFile: ts.SourceFile): ts.TypeLiteralNode[] {
  return [...nodesIn(sourceFile)].filter(ts.isTypeLiteralNode).filter(node => needsName(node, sourceFile.fileName));
}
