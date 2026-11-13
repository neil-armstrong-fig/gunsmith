const UNKNOWN_SPEC = "unknown-spec";

/** A spec's name for its results file: the file's own name without the folders and the `.eval.ts`. */
export function specNameOf(testPath: string | undefined): string {
  if (testPath === undefined) {
    return UNKNOWN_SPEC;
  }

  const fileName = testPath.split("/").pop() ?? UNKNOWN_SPEC;

  return fileName.replace(/\.eval\.ts$/, "");
}
