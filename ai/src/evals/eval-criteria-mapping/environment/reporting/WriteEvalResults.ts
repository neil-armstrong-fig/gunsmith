import {mkdirSync, writeFileSync} from "node:fs";
import {archiveEvalResult} from "@evals/eval-criteria-mapping/environment/archive/ArchiveEvalResult";
import {summariseResults} from "@evals/eval-criteria-mapping/environment/reporting/SummariseResults";
import type {ResultsRun} from "@evals/eval-criteria-mapping/environment/reporting/types/ResultsRun";

const RESULTS_DIRECTORY = "src/evals/results";

/**
 * Leaves a small JSON summary of one spec's run. Free-tier LangSmith traces expire after 14 days, so every run also writes one
 * here. One file per spec and tier (`<Spec>-<tier>-latest.json`), because spec files run one after another and each only knows
 * its own results. `*-latest.json` is git-ignored and is overwritten by the next run, so the same summary is also kept for good in the
 * main checkout's `private-source/eval-results/` (see `archiveEvalResult`).
 */
export function writeEvalResults(run: ResultsRun): void {
  const summary = `${JSON.stringify(summariseResults(run), undefined, 2)}\n`;

  mkdirSync(RESULTS_DIRECTORY, {recursive: true});
  writeFileSync(`${RESULTS_DIRECTORY}/${run.spec}-${run.tier}-latest.json`, summary);
  archiveEvalResult(`${run.spec}-${run.tier}.json`, summary);
}
