import {existsSync} from "node:fs";
import {join} from "node:path";

const STARTUP_FILES = [
  "CLAUDE.md",
  "HANDOFF.md",
  "TODO.md",
  "TODO-build.md",
  "TODO-play.md",
  "TODO-engine.md",
  "TODO-ai.md",
  "TODO-server.md",
  "TODO-budget.md",
  "TODO-art.md",
  "TODO-ship.md",
] as const;

/** Startup documents checked for valid references; a session reads only its own persona checklist. */
export function startupFiles(root: string): string[] {
  return STARTUP_FILES.map(file => join(root, file)).filter(existsSync);
}
