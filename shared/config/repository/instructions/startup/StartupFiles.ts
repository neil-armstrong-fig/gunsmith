import {existsSync} from "node:fs";
import {join} from "node:path";

const STARTUP_FILES = [
  "CLAUDE.md",
  "HANDOFF.md",
  "TODO.md",
  "MVP-TODO.md",
  "POSTMVP-TODO.md",
  "TODO-ai.md",
  "TODO-netcode.md",
] as const;

/** Startup documents checked for valid references; a session reads only its own persona checklist. */
export function startupFiles(root: string): string[] {
  return STARTUP_FILES.map(file => join(root, file)).filter(existsSync);
}
