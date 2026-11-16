import ts from "typescript";

/** How TypeScript should read the file: as TSX for `.tsx`, otherwise as TS. */
export function scriptKindOf(filename: string): ts.ScriptKind {
  if (filename.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  return ts.ScriptKind.TS;
}
