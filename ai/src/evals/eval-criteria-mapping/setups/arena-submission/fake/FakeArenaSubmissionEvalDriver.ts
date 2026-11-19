import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/ArenaModerationFakeModel";
import {ArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/ArenaSubmissionEvalDriver";

/** Arena-submission screening on a canned moderator and the fake tier's built-in arenas: deterministic, so one trial. */
export class FakeArenaSubmissionEvalDriver extends ArenaSubmissionEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): ArenaSubmissionDependencies {
    return {moderator: new ArenaModerationFakeModel(), builtInArenas: BUILT_IN_ARENAS};
  }
}
