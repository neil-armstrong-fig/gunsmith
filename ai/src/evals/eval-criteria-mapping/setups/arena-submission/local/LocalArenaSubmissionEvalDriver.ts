import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {createLocalChatModel} from "@evals/eval-criteria-mapping/environment/tier/local/CreateLocalChatModel";
import {LOCAL_TRIALS} from "@evals/eval-criteria-mapping/environment/tier/local/LocalTrials";
import {ArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/shared/ArenaSubmissionEvalDriver";

/** Arena-submission screening on the local model: free but not fully repeatable, so several trials. */
export class LocalArenaSubmissionEvalDriver extends ArenaSubmissionEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, LOCAL_TRIALS);
  }

  // Temperature 0 and thinking off, as the arena's local models. The only model call is the moderation verdict, a boolean and a sentence.
  protected createModels(): ArenaSubmissionDependencies {
    return {
      moderator: createLocalChatModel({temperature: 0, numPredict: 100}),
      builtInArenas: BUILT_IN_ARENAS,
    };
  }
}
