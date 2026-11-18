import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {AppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/shared/AppearanceEvalDriver";
import {createPaidAppearanceModel} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceModel";

/** The appearance pipeline on Haiku, one trial because it costs money, and stopped when the ledger has no room or a paid call failed. */
export class PaidAppearanceEvalDriver extends AppearanceEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "paid", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  protected createModels(): AppearanceDependencies {
    return {generator: createPaidAppearanceModel()};
  }

  // The spend guard inside the model stops a call, but the pipeline reads a failed call as "no answer" and falls back, which would
  // look like a weak model. Checking here before each request makes running out of room fail the run in words.
  protected override beforeRequest(): void {
    paidSpendLedger().assertRoom();
  }

  protected override afterOutcome(): void {
    const failure = paidSpendGuard().takeFailure();
    if (failure !== undefined) {
      throw new Error(`A paid model call failed, so this result says nothing about the drawing: ${failure}`);
    }
  }
}
