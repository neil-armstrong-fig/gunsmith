import ts from "typescript";

/** Whether the node is inside a component's own, unexported `Props` in a `.tsx` file, which may stay inline. */
export function isLocalProps(node: ts.Node, filename: string): boolean {
  if (!filename.endsWith(".tsx")) {
    return false;
  }

  for (let parent = node.parent; parent; parent = parent.parent) {
    if (!ts.isInterfaceDeclaration(parent) && !ts.isTypeAliasDeclaration(parent)) {
      continue;
    }
    if (parent.name.text !== "Props") {
      continue;
    }

    return !ts.getModifiers(parent)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
  }
  return false;
}
