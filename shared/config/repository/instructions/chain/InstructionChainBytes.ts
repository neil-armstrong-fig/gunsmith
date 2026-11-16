import {statSync} from "node:fs";
import {dirname, relative, isAbsolute} from "node:path";
import {instructionAt} from "@gunsmith/shared/config/repository/instructions/selection/InstructionAt.ts";

/** The blank line (two newline bytes) that joins one instruction file to the next when an agent reads the chain. */
const JOINING_BLANK_LINE_BYTES = 2;

/** How many bytes an agent reads for `file`: its instruction file and each one above it up to the repository's root. */
export function instructionChainBytes(root: string, file: string): number {
  const relativeFile = relative(root, file);
  if (relativeFile.startsWith("..") || isAbsolute(relativeFile)) {
    throw new Error("Instruction file is outside the repository.");
  }

  let bytes = 0;
  for (let folder = dirname(file); ; folder = dirname(folder)) {
    const instruction = instructionAt(folder);
    if (instruction) {
      if (bytes > 0) bytes += JOINING_BLANK_LINE_BYTES;
      bytes += statSync(instruction).size;
    }

    if (folder === root) {
      return bytes;
    }
  }
}
