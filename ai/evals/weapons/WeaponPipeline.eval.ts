import * as ls from "langsmith/vitest";
// Imported, not the global: inside `ls.test` the global `expect` is not vitest's (it has no `toEqual`).
import {afterAll, expect} from "vitest";
import {weaponEvaluators} from "@evals/evaluators/WeaponEvaluators";
import {createEvalModels} from "@evals/models/CreateEvalModels";
import {parseEvalTier} from "@evals/models/EvalTier";
import {writeEvalResults} from "@evals/reporting/WriteEvalResults";
import type {EvalCaseResult} from "@evals/reporting/WriteEvalResults";
import {weaponEvalCases} from "@evals/weapons/WeaponEvalCases";
import {generateWeapon} from "@src/pipeline/GenerateWeapon";

// `pnpm evals:local` (or `evals:fake`). The tier comes from EVAL_TIER; see `evals/models/EvalTier.ts`.
const tier = parseEvalTier(process.env.EVAL_TIER);
const models = createEvalModels(tier);
const caseResults: EvalCaseResult[] = [];

ls.describe(`weapon-pipeline (${tier})`, () => {
  for (const evalCase of weaponEvalCases) {
    ls.test(
      evalCase.name,
      {inputs: {prompt: evalCase.prompt}, referenceOutputs: {expectation: evalCase.expectation}},
      async () => {
        const outcome = await generateWeapon({prompt: evalCase.prompt}, models);
        const scores = weaponEvaluators.map(evaluator => evaluator({evalCase, outcome}));

        ls.logOutputs({...outcome});
        for (const score of scores) {
          ls.logFeedback({key: score.key, score: score.score, comment: score.comment});
        }
        caseResults.push({name: evalCase.name, scores});

        // Names the evaluators that scored 0, with their comments, so a red case says why.
        expect(scores.filter(score => score.score === 0)).toEqual([]);
      },
    );
  }

  afterAll(() => {
    writeEvalResults("weapon-pipeline", tier, caseResults);
  });
});
