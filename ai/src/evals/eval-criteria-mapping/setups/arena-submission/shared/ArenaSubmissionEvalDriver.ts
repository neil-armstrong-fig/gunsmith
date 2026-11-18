import {screenArenaSubmissions} from "@gunsmith/ai/pipeline/arena-submission/ScreenArenaSubmissions";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";

/**
 * What every tier's arena-submission driver does: put submissions through the real screening on the models its tier builds, as many
 * times as the tier (or `EVAL_TRIALS`) asks. A tier overrides `createModels`.
 */
export abstract class ArenaSubmissionEvalDriver implements ArenaSubmissionDriver {
  readonly trials: number;
  private models: ArenaSubmissionDependencies | undefined;

  protected constructor(requestedTrials: string | undefined, defaultTrials: number) {
    this.trials = trialCount(requestedTrials, defaultTrials);
  }

  run(submissions: readonly ArenaSubmission[]): Promise<ArenaSubmissionScreening> {
    return screenArenaSubmissions({submissions}, this.modelsOnFirstRun());
  }

  protected abstract createModels(): ArenaSubmissionDependencies;

  // Built on the first run, not in the constructor: the mapping builds every driver when a spec file loads, and a tier without a
  // model (the paid one, for now) must not fail a run that never screens.
  private modelsOnFirstRun(): ArenaSubmissionDependencies {
    this.models ??= this.createModels();

    return this.models;
  }
}
