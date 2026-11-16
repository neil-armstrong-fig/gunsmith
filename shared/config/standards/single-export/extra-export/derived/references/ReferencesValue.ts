import ts from "typescript";
import {nodesIn} from "@gunsmith/shared/config/standards/source/nodes/NodesIn.ts";

/** Whether the type refers to the value by `typeof`. */
export function referencesValue(node: ts.Node, valueName: string): boolean {
  for (const child of nodesIn(node)) {
    if (ts.isTypeQueryNode(child) && ts.isIdentifier(child.exprName) && child.exprName.text === valueName) {
      return true;
    }
  }
  return false;
}
