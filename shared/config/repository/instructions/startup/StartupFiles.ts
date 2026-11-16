import {existsSync} from "node:fs";
import {join} from "node:path";

const STARTUP_FILES = ["CLAUDE.md", "HANDOFF.md", "TODO.md", "TODO-build.md", "TODO-ai.md", "TODO-art.md"] as const;

/** The documents every fresh session reads first that exist in the repository. */
export function startupFiles(root: string): string[] {
  return STARTUP_FILES.map(file => join(root, file)).filter(existsSync);
}
