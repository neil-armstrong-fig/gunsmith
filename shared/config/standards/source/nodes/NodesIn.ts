import type ts from "typescript";

/** Walk the syntax tree without following its parent links. */
export function* nodesIn(node: ts.Node): Generator<ts.Node, void> {
  const pending: ts.Node[] = [node];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      continue;
    }

    yield current;
    current.forEachChild(child => {
      pending.push(child);
    });
  }
}
