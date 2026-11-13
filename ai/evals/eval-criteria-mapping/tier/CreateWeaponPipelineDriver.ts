import {createEvalModels} from "@evals/eval-criteria-mapping/tier/models/CreateEvalModels";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";
import type {WeaponPipelineDriver} from "@evals/dsl/types/WeaponPipelineDriver";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";

/** The real pipeline on one tier's models, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createWeaponPipelineDriver(tier: EvalTier, requestedTrials: string | undefined): WeaponPipelineDriver {
  const weaponPipelineDependencies = createEvalModels(tier);

  return {
    trials: trialCount(tier, requestedTrials),
    run: prompt => generateWeapon({prompt}, weaponPipelineDependencies),
  };
}
