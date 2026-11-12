import {mkdirSync, writeFileSync} from "node:fs";
import type {EvalTier} from "@evals/models/types/EvalTier";
import type {EvalCaseResult} from "@evals/reporting/types/EvalCaseResult";
import type {SuiteTally} from "@evals/reporting/types/SuiteTally";

const RESULTS_DIRECTORY = "evals/results";

/**
 * Leaves a small JSON summary of a run. Free-tier LangSmith traces expire after 14 days, so every run also writes one here.
 * `*-latest.json` is git-ignored; copy one to a dated, committed file when it is a baseline worth keeping.
 */
export function writeEvalResults(suite: string, tier: EvalTier, results: EvalCaseResult[]): void {
  const summary = {
    suite,
    tier,
    ranAt: new Date().toISOString(),
    cases: results.length,
    casesPassed: results.filter(passed).length,
    regression: tally(results, "regression"),
    capability: tally(results, "capability"),
    results,
  };

  mkdirSync(RESULTS_DIRECTORY, {recursive: true});
  writeFileSync(`${RESULTS_DIRECTORY}/${suite}-${tier}-latest.json`, `${JSON.stringify(summary, undefined, 2)}\n`);
}

function passed(result: EvalCaseResult): boolean {
  return result.scores.every(score => score.score === 1);
}

function tally(results: EvalCaseResult[], suite: EvalCaseResult["suite"]): SuiteTally {
  const inSuite = results.filter(result => result.suite === suite);

  return {cases: inSuite.length, passed: inSuite.filter(passed).length};
}
