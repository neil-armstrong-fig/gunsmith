import {readdirSync, statSync} from "node:fs";
import {join} from "node:path";
import {commitLabel} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/commit-label/CommitLabel";
import {primaryCheckoutOf} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/primary-checkout/PrimaryCheckoutOf";

/**
 * Where one run's results are kept for good: `private-source/eval-results/<run>-<commit>` in the repository's MAIN checkout, never in
 * the worktree a run happened to start from, because a worktree is removed and `private-source/` (git-ignored, so too big or too
 * private for git) lives only in the main checkout. Nothing when the run has no id (`EVAL_RUN_ID`, set by the `evals:*` scripts, so
 * a run started by hand archives nothing), when `EVAL_ARCHIVE=0`, or when the main checkout has no `private-source/` (CI, a fresh clone).
 */
export function archiveFolder(environment: NodeJS.ProcessEnv, directory: string): string | undefined {
  const runId = environment.EVAL_RUN_ID;
  if (runId === undefined || runId === "") {
    return undefined;
  }

  if (environment.EVAL_ARCHIVE === "0") {
    return undefined;
  }

  const checkout = primaryCheckoutOf(directory);
  if (checkout === undefined) {
    return undefined;
  }

  const privateSource = join(checkout, "private-source");
  if (!isDirectory(privateSource)) {
    return undefined;
  }

  const results = join(privateSource, "eval-results");
  const existing = existingRunFolder(results, runId);
  if (existing !== undefined) {
    return join(results, existing);
  }

  return join(results, `${runId}-${commitLabel(directory)}`);
}

/** Each spec file of a run is a process of its own and the working tree can change between them, so the run's first file names the folder. */
function existingRunFolder(results: string, runId: string): string | undefined {
  try {
    return readdirSync(results).find(name => name.startsWith(`${runId}-`));
  } catch {
    return undefined;
  }
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}
