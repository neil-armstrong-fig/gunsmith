import {createEvalModels} from "@evals/eval-criteria-mapping/weapon/models/CreateEvalModels";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendLedger";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";
import {runPaidWeapon} from "@evals/eval-criteria-mapping/weapon/paid/RunPaidWeapon";
import type {WeaponPipelineDriver} from "@evals/dsl/types/WeaponPipelineDriver";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

// What every paid weapon request cost in tokens and time, one JSON line each (`*-latest.jsonl` is git-ignored).
const PAID_CALL_LOG = "evals/results/paid-weapon-calls-latest.jsonl";

/** The real pipeline on one tier's models, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createWeaponPipelineDriver(tier: EvalTier, requestedTrials: string | undefined): WeaponPipelineDriver {
  // Built on the first request, not here: the mapping builds every driver when a spec file loads, and the paid models need a key,
  // which a run that never asks for a weapon must not need.
  let weaponPipelineDependencies: WeaponPipelineDependencies | undefined;

  return {
    trials: trialCount(tier, requestedTrials),
    run: prompt => {
      weaponPipelineDependencies ??= createEvalModels(tier);
      const dependencies = weaponPipelineDependencies;
      const pipeline = (request: string): Promise<WeaponOutcome> => generateWeapon({prompt: request}, dependencies);

      if (tier === "paid") {
        return runPaidWeapon(prompt, {
          pipeline,
          ledger: paidSpendLedger(),
          guard: paidSpendGuard(),
          logFile: PAID_CALL_LOG,
        });
      }

      return pipeline(prompt);
    },
  };
}
