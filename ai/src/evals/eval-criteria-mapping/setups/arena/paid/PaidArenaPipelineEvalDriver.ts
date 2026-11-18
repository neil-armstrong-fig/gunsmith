import {ArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/shared/ArenaPipelineEvalDriver";

/**
 * The arena evals have no paid tier yet. The mapping builds every driver when a spec file loads, so this one exists and says so
 * when a request is made, not when it is built: a paid run of the weapon specs must not be stopped by it.
 */
export class PaidArenaPipelineEvalDriver extends ArenaPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "paid", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  protected createModels(): never {
    throw new Error(
      "The arena evals have no paid tier yet: a paid call needs the user to review its cost first (TODO-ai.md, paid-spend ledger).",
    );
  }
}
