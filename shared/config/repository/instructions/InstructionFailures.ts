import {basename, dirname, relative} from "node:path";
import {filesBelow} from "@gunsmith/shared/config/repository/discovery/FilesBelow.ts";
import {instructionAt} from "@gunsmith/shared/config/repository/instructions/selection/InstructionAt.ts";
import {instructionChainBytes} from "@gunsmith/shared/config/repository/instructions/chain/InstructionChainBytes.ts";
import {documentFailures} from "@gunsmith/shared/config/repository/instructions/documents/DocumentFailures.ts";
import {startupFiles} from "@gunsmith/shared/config/repository/instructions/startup/StartupFiles.ts";

const INSTRUCTION_BUDGET = 65536;

/** What is wrong with the instruction files and the startup documents: a chain an agent reads that is longer than `limit` bytes, a link to a file that is not there, a stale startup instruction. */
export function instructionFailures(root: string, limit = INSTRUCTION_BUDGET): string[] {
  const directories = new Set(
    filesBelow(root)
      .filter(file => ["AGENTS.md", "AGENTS.override.md"].includes(basename(file)))
      .map(dirname),
  );
  const instructionFiles = [...directories].map(instructionAt).filter(file => file !== undefined);
  const budgetFailures = instructionFiles.flatMap(file => {
    const bytes = instructionChainBytes(root, file);
    if (bytes <= limit) {
      return [];
    }

    return [`${relative(root, file)}: instruction chain ${bytes} exceeds ${limit} bytes`];
  });
  const documents = [...instructionFiles, ...startupFiles(root)];
  return [...budgetFailures, ...documents.flatMap(file => documentFailures(root, file))];
}
