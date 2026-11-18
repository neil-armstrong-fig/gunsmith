import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/ArenaModerationFakeModel";
import {BUILT_IN_ARENA_FIXTURES} from "@evals/eval-criteria-mapping/setups/arena/shared/built-ins/BuiltInArenaFixtures";
import {ArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/ArenaSubmissionEvalDriver";

/** Arena-submission screening on a canned moderator and the fake tier's built-in arenas: deterministic, so one trial. */
export class FakeArenaSubmissionEvalDriver extends ArenaSubmissionEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): ArenaSubmissionDependencies {
    return {moderator: new ArenaModerationFakeModel(), builtInArenas: BUILT_IN_ARENA_FIXTURES};
  }
}
