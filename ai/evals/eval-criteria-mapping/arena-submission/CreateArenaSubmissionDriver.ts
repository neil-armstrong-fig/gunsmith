import {screenArenaSubmissions} from "@gunsmith/ai/pipeline/arena-submission/ScreenArenaSubmissions";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import {createArenaSubmissionEvalModels} from "@evals/eval-criteria-mapping/arena-submission/models/CreateArenaSubmissionEvalModels";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

/** The real arena-submission screening on one tier's models, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createArenaSubmissionDriver(
  tier: EvalTier,
  requestedTrials: string | undefined,
): ArenaSubmissionDriver {
  // Built on the first run, not here: the mapping builds every driver when a spec file loads, and the tiers without a model
  // (the paid one, for now) must not fail a run that never screens.
  let dependencies: ArenaSubmissionDependencies | undefined;

  return {
    trials: trialCount(tier, requestedTrials),
    run: (submissions: readonly ArenaSubmission[]): Promise<ArenaSubmissionScreening> => {
      dependencies ??= createArenaSubmissionEvalModels(tier);

      return screenArenaSubmissions({submissions}, dependencies);
    },
  };
}
