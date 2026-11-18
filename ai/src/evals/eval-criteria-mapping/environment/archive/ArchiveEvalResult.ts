import {mkdirSync, writeFileSync} from "node:fs";
import {archiveFolder} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/ArchiveFolder";

/**
 * Keeps one result file of this run for good, beside the run's other files, in the main checkout's `private-source/` (see
 * `archiveFolder`): the results next to the code are git-ignored and die with their worktree, and a run's drawings and summaries
 * can be too big for git. The same name overwrites within a run (a growing contact sheet), never across runs. Does nothing when the
 * run is not archived, so a missing `private-source/` never fails a run.
 */
export function archiveEvalResult(fileName: string, content: string): void {
  const folder = archiveFolder(process.env, process.cwd());
  if (folder === undefined) {
    return;
  }

  mkdirSync(folder, {recursive: true});
  writeFileSync(`${folder}/${fileName}`, content);
}
