import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/weapon/types/WeaponPipelineDependencies";
import {runPaidRequest} from "@evals/eval-criteria-mapping/environment/tier/paid/run/RunPaidRequest";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {createPaidWeaponModels} from "@evals/eval-criteria-mapping/setups/weapon/paid/models/PaidWeaponModels";
import {WeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/shared/WeaponPipelineEvalDriver";
import type {WeaponPipelineRun} from "@evals/eval-criteria-mapping/setups/weapon/shared/types/WeaponPipelineRun";

// What every paid weapon request cost in tokens and time, one JSON line each (`*-latest.jsonl` is git-ignored).
const PAID_CALL_LOG = "src/evals/results/paid-weapon-calls-latest.jsonl";

/** The weapon pipeline on Haiku: one trial because it costs money, every request checked against the ledger and logged. */
export class PaidWeaponPipelineEvalDriver extends WeaponPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): WeaponPipelineDependencies {
    return createPaidWeaponModels();
  }

  protected override runThrough(prompt: string, pipeline: WeaponPipelineRun): Promise<WeaponOutcome> {
    return runPaidRequest(prompt, {
      run: () => pipeline(prompt),
      ledger: paidSpendLedger(),
      guard: paidSpendGuard(),
      logFile: PAID_CALL_LOG,
      subject: "the weapon",
    });
  }
}
