import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

// A small arena every evaluator accepts: walled, one open room, no stairs. Written here, not taken from the pipeline.
const PASSING_ARENA_ROWS = ["#######", "#.....#", "#.....#", "#.....#", "#######"];

/** A created arena on the clean path (moderation and generation, two calls), refunded nothing; a test overrides only what it is about. */
export function passingArenaInput(overrides: Partial<ArenaOutcome> = {}): ArenaEvalInput {
  return {
    outcome: {
      status: "created",
      arena: {name: "Plain Room", rows: PASSING_ARENA_ROWS},
      refunded: false,
      nodes: ["precheck", "moderation", "generate", "validate"],
      modelCalls: 2,
      ...overrides,
    },
  };
}
