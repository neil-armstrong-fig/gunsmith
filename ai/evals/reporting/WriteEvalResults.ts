import {mkdirSync, writeFileSync} from "node:fs";
import type {EvalTier} from "@evals/models/EvalTier";
import type {EvalScore} from "@evals/types/EvalScore";

export interface EvalCaseResult {
  name: string;
  scores: EvalScore[];
}

const RESULTS_DIRECTORY = "evals/results";

// Free-tier LangSmith traces expire after 14 days, so every run also leaves a small JSON summary here. `*-latest.json` is
// git-ignored; copy one to a dated, committed file when it is a baseline worth keeping.
export function writeEvalResults(suite: string, tier: EvalTier, results: EvalCaseResult[]): void {
  const passed = results.filter(result => result.scores.every(score => score.score === 1)).length;
  const summary = {suite, tier, ranAt: new Date().toISOString(), cases: results.length, casesPassed: passed, results};

  mkdirSync(RESULTS_DIRECTORY, {recursive: true});
  writeFileSync(`${RESULTS_DIRECTORY}/${suite}-${tier}-latest.json`, `${JSON.stringify(summary, undefined, 2)}\n`);
}
