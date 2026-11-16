import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {instructionFailures} from "@gunsmith/shared/config/repository/instructions/InstructionFailures.ts";
import {artScriptFailures} from "@gunsmith/shared/config/repository/artifacts/ArtScriptFailures.ts";

const entry = process.argv[1];
if (entry && resolve(entry) === fileURLToPath(import.meta.url)) {
  const root = resolve(import.meta.dirname, "../../..");
  const failures = checkRepository(root);
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  }
}

/** Checks the repository's instruction files and `art`'s scripts, and lists every failure. Run as a script (`pnpm checks:repository`), it exits non-zero when there is one. */
export function checkRepository(root: string): string[] {
  return [...instructionFailures(root), ...artScriptFailures(root)];
}
