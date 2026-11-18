import {ArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/ArenaSubmissionEvalDriver";

/**
 * The arena-submission evals have no paid tier yet. The mapping builds every driver when a spec file loads, so this one exists and
 * says so when a screening is made, not when it is built: a paid run of the weapon specs must not be stopped by it.
 */
export class PaidArenaSubmissionEvalDriver extends ArenaSubmissionEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): never {
    throw new Error(
      "The arena-submission evals have no paid tier yet: a paid call needs the user to review its cost first (TODO-ai.md, paid-spend ledger).",
    );
  }
}
