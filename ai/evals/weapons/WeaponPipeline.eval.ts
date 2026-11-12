import * as ls from "langsmith/vitest";
// Imported, not the global: inside `ls.test` the global `expect` is not vitest's (it has no `toEqual`).
import {afterAll, expect} from "vitest";
import {createEvalModels} from "@evals/models/CreateEvalModels";
import {parseEvalTier} from "@evals/models/ParseEvalTier";
import {trialCount} from "@evals/models/TrialCount";
import type {EvalCaseResult} from "@evals/reporting/types/EvalCaseResult";
import {writeEvalResults} from "@evals/reporting/WriteEvalResults";
import {runWeaponCase} from "@evals/weapons/RunWeaponCase";
import {weaponEvalCases} from "@evals/weapons/WeaponEvalCases";

// `pnpm evals:local` (or `evals:fake`). EVAL_TIER picks the model tier (`evals/models/EvalTier.ts`); EVAL_TRIALS overrides how
// many times each case runs; EVAL_GATE=regression makes only `regression` cases fail the run (what CI will use), while
// `capability` cases are still run, scored and reported. By default every red case fails, so a new case is seen failing first.
const tier = parseEvalTier(process.env.EVAL_TIER);
const trials = trialCount(tier, process.env.EVAL_TRIALS);
const gateOnlyRegression = process.env.EVAL_GATE === "regression";
const models = createEvalModels(tier);
const caseResults: EvalCaseResult[] = [];

ls.describe(`weapon-pipeline (${tier})`, () => {
  for (const evalCase of weaponEvalCases) {
    ls.test(
      `${evalCase.suite}: ${evalCase.name}`,
      {inputs: {prompt: evalCase.prompt}, referenceOutputs: {expectation: evalCase.expectation}},
      async () => {
        const run = await runWeaponCase(evalCase, models, trials);

        ls.logOutputs({...run.outcomes[run.outcomes.length - 1]});
        for (const score of run.scores) {
          ls.logFeedback({key: score.key, score: score.score, comment: score.comment});
        }
        caseResults.push({
          name: evalCase.name,
          kind: evalCase.kind,
          suite: evalCase.suite,
          trials,
          durationMs: run.durationMs,
          scores: run.scores,
        });

        // Names the evaluators that scored 0, with their comments, so a red case says why.
        const failures = run.scores.filter(score => score.score === 0);
        if (gateOnlyRegression && evalCase.suite === "capability") {
          if (failures.length > 0) {
            console.warn(`capability case "${evalCase.name}" is red (not gating): ${JSON.stringify(failures)}`);
          }
          return;
        }

        expect(failures).toEqual([]);
      },
    );
  }

  afterAll(() => {
    writeEvalResults("weapon-pipeline", tier, caseResults);
  });
});
