import {mkdirSync, writeFileSync} from "node:fs";
import {summariseResults} from "@evals/eval-criteria-mapping/reporting/SummariseResults";
import type {ResultsRun} from "@evals/eval-criteria-mapping/reporting/types/ResultsRun";

const RESULTS_DIRECTORY = "evals/results";

/**
 * Leaves a small JSON summary of one spec's run. Free-tier LangSmith traces expire after 14 days, so every run also writes one
 * here. One file per spec and tier (`<Spec>-<tier>-latest.json`), because spec files run one after another and each only knows
 * its own results. `*-latest.json` is git-ignored; copy one to a dated, committed file when it is a baseline worth keeping.
 */
export function writeEvalResults(run: ResultsRun): void {
  mkdirSync(RESULTS_DIRECTORY, {recursive: true});
  writeFileSync(
    `${RESULTS_DIRECTORY}/${run.spec}-${run.tier}-latest.json`,
    `${JSON.stringify(summariseResults(run), undefined, 2)}\n`,
  );
}
