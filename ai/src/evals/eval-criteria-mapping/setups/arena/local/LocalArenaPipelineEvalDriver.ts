import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {parseArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ParseArenaFormat";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {createLocalChatModel} from "@evals/eval-criteria-mapping/environment/tier/local/CreateLocalChatModel";
import {ArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/shared/ArenaPipelineEvalDriver";

// An arena is a few hundred tokens of rows, so a local request takes far longer than a weapon's: one trial keeps the local run short.
// `EVAL_TRIALS=3` brings back the repeated trials when it is worth the wait.
const ARENA_LOCAL_TRIALS = 1;

/** The arena pipeline on the local model, which keeps its arenas by default: a real model's arenas are worth looking at. */
export class LocalArenaPipelineEvalDriver extends ArenaPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "local", requestedTrials, defaultTrials: ARENA_LOCAL_TRIALS, keepsGeneratedByDefault: true});
  }

  // `EVAL_ARENA_FORMAT=shapes` has the model describe the arena as shapes instead of rows, to compare the two formats on one model.
  // Temperature 0 and thinking off, as the weapon's local models: repeatable output for a loop that has to be fast. An arena is
  // a few hundred tokens of rows, so the generator is given far more room than a weapon's stats.
  protected createModels(): ArenaPipelineDependencies {
    return {
      generator: createLocalChatModel({temperature: 0, numPredict: 1500}),
      moderator: createLocalChatModel({temperature: 0, numPredict: 100}),
      format: parseArenaFormat(process.env.EVAL_ARENA_FORMAT),
      builtInArenas: BUILT_IN_ARENAS,
    };
  }
}
