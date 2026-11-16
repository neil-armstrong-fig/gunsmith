import {existsSync} from "node:fs";
import {dirname, resolve} from "node:path";

/** Checks local Markdown link targets; anchors and remote URLs are not filesystem references. */
export function missingReferences(text: string, file: string): string[] {
  const failures: string[] = [];
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1]?.split("#")[0];
    if (!target || /^[a-z]+:|^\//i.test(target)) {
      continue;
    }

    if (!existsSync(resolve(dirname(file), target))) failures.push(`missing reference ${target}`);
  }
  return failures;
}
