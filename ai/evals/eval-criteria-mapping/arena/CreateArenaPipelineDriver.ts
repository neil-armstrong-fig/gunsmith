import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {createArenaEvalModels} from "@evals/eval-criteria-mapping/arena/models/CreateArenaEvalModels";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

// An arena is a few hundred tokens of rows, so a local request takes far longer than a weapon's: one trial keeps the local run short.
// `EVAL_TRIALS=3` brings back the repeated trials when it is worth the wait.
const ARENA_LOCAL_TRIALS = 1;

/** The real arena pipeline on one tier's models, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createArenaPipelineDriver(tier: EvalTier, requestedTrials: string | undefined): ArenaPipelineDriver {
  // Built on the first request, not here: the mapping builds every driver when a spec file loads, and the tiers without a model
  // (the paid one, for now) must not fail a run that never asks for an arena.
  let dependencies: ArenaPipelineDependencies | undefined;

  return {
    trials: trialCount(tier, requestedTrials, ARENA_LOCAL_TRIALS),
    run: prompt => {
      dependencies ??= createArenaEvalModels(tier);

      return generateArena({prompt}, dependencies);
    },
  };
}
