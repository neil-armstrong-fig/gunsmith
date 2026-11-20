import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import {runPaidRequest} from "@evals/eval-criteria-mapping/environment/tier/paid/run/RunPaidRequest";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {AppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/shared/AppearanceEvalDriver";
import type {AppearancePipelineRun} from "@evals/eval-criteria-mapping/setups/appearance/shared/types/AppearancePipelineRun";
import {createPaidAppearanceModel} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceModel";

// What every paid drawing request cost in tokens and time, one JSON line each (`*-latest.jsonl` is git-ignored).
const PAID_CALL_LOG = "src/evals/results/paid-appearance-calls-latest.jsonl";

/** The appearance pipeline on Haiku, one trial because it costs money, every request checked against the ledger and logged. */
export class PaidAppearanceEvalDriver extends AppearanceEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "paid", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  protected createModels(): AppearanceDependencies {
    return {generator: createPaidAppearanceModel()};
  }

  // A drawing is not a graph, so its calls carry no stage of their own: they are the `draw` stage. The runner also fails a request
  // whose paid call failed or was cut off, which the pipeline would read as "no answer" and fall back, looking like a weak model.
  protected override runThrough(prompt: string, pipeline: AppearancePipelineRun): Promise<AppearanceOutcome> {
    return runPaidRequest(prompt, {
      run: () => pipeline(prompt),
      ledger: paidSpendLedger(),
      guard: paidSpendGuard(),
      logFile: PAID_CALL_LOG,
      subject: "the drawing",
      defaultStage: "draw",
    });
  }
}
