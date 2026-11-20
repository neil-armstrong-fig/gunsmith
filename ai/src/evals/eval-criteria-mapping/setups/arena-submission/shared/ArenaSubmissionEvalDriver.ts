import {screenArenaSubmissions} from "@gunsmith/ai/pipeline/arena-submission/ScreenArenaSubmissions";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";
import type {ArenaSubmissionRun} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/types/ArenaSubmissionRun";

/**
 * What every tier's arena-submission driver does: put submissions through the real screening on the models its tier builds, as many
 * times as the tier (or `EVAL_TRIALS`) asks. A tier overrides `createModels`, and `runThrough` where it must wrap a screening (the paid tier).
 */
export abstract class ArenaSubmissionEvalDriver implements ArenaSubmissionDriver {
  readonly trials: number;
  private models: ArenaSubmissionDependencies | undefined;

  protected constructor(requestedTrials: string | undefined, defaultTrials: number) {
    this.trials = trialCount(requestedTrials, defaultTrials);
  }

  run(submissions: readonly ArenaSubmission[]): Promise<ArenaSubmissionScreening> {
    const dependencies = this.modelsOnFirstRun();

    return this.runThrough(submissions, requested => screenArenaSubmissions({submissions: requested}, dependencies));
  }

  protected abstract createModels(): ArenaSubmissionDependencies;

  /** What a screening is put through. The models exist by now; the paid tier checks its spend and logs the calls around it here. */
  protected runThrough(
    submissions: readonly ArenaSubmission[],
    screening: ArenaSubmissionRun,
  ): Promise<ArenaSubmissionScreening> {
    return screening(submissions);
  }

  // Built on the first run, not in the constructor: the mapping builds every driver when a spec file loads, and the paid models
  // need a key, which a run that never screens must not need.
  private modelsOnFirstRun(): ArenaSubmissionDependencies {
    this.models ??= this.createModels();

    return this.models;
  }
}
