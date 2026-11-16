import {readFileSync} from "node:fs";
import {relative} from "node:path";
import {missingReferences} from "@gunsmith/shared/config/repository/instructions/documents/references/MissingReferences.ts";

/** Detects the two observed stale directions, not arbitrary contradictions in prose. */
export function documentFailures(root: string, file: string): string[] {
  const text = readFileSync(file, "utf8");
  const failures = missingReferences(text, file);
  if (/fuzzy frontend comes first|both are loaded/i.test(text)) failures.push("stale startup instruction");

  return failures.map(failure => `${relative(root, file)}: ${failure}`);
}
