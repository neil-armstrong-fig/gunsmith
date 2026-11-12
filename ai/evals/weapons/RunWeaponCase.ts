import {weaponEvaluators} from "@evals/evaluators/WeaponEvaluators";
import {combineTrials} from "@evals/reporting/CombineTrials";
import type {EvalScore} from "@evals/types/EvalScore";
import type {WeaponEvalCase} from "@evals/types/WeaponEvalCase";
import type {WeaponCaseRun} from "@evals/weapons/types/WeaponCaseRun";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDeps} from "@gunsmith/ai/pipeline/types/WeaponPipelineDeps";

/** Runs one case `trials` times through the pipeline and scores every trial; the scores are combined so all trials must pass. */
export async function runWeaponCase(
  evalCase: WeaponEvalCase,
  models: WeaponPipelineDeps,
  trials: number,
): Promise<WeaponCaseRun> {
  const started = Date.now();
  const outcomes: WeaponOutcome[] = [];
  const trialScores: EvalScore[][] = [];

  for (let trial = 0; trial < trials; trial += 1) {
    const outcome = await generateWeapon({prompt: evalCase.prompt}, models);

    outcomes.push(outcome);
    trialScores.push(weaponEvaluators.map(evaluator => evaluator({evalCase, outcome})));
  }

  return {outcomes, scores: combineTrials(trialScores), durationMs: Date.now() - started};
}
