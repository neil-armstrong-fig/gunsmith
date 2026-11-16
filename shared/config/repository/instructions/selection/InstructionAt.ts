import {existsSync, statSync} from "node:fs";
import {join} from "node:path";

const INSTRUCTION_NAMES = ["AGENTS.override.md", "AGENTS.md"] as const;

/** The instruction file an agent reads in `directory`: `AGENTS.override.md` if it has content, else `AGENTS.md`. */
export function instructionAt(directory: string): string | undefined {
  return INSTRUCTION_NAMES.map(name => join(directory, name)).find(file => existsSync(file) && statSync(file).size > 0);
}
