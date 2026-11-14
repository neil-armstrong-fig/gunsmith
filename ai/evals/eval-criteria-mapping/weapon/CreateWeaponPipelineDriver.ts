import {createEvalModels} from "@evals/eval-criteria-mapping/weapon/models/CreateEvalModels";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";
import type {WeaponPipelineDriver} from "@evals/dsl/types/WeaponPipelineDriver";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";

/** The real pipeline on one tier's models, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createWeaponPipelineDriver(tier: EvalTier, requestedTrials: string | undefined): WeaponPipelineDriver {
  // Built on the first request, not here: the mapping builds every driver when a spec file loads, and the paid tier has no weapon
  // models yet (it throws), which must not stop a spec that only draws.
  let weaponPipelineDependencies: WeaponPipelineDependencies | undefined;

  return {
    trials: trialCount(tier, requestedTrials),
    run: prompt => {
      weaponPipelineDependencies ??= createEvalModels(tier);

      return generateWeapon({prompt}, weaponPipelineDependencies);
    },
  };
}
