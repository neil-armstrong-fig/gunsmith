import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaAnswered";

/**
 * A request that was asked for properly ends in one of two honest ways: an arena the model made, or no arena and a reason the player
 * can read. Never with nothing and no word, and never with another arena handed over in the model's place (the user, 2026-11-21).
 */
export function arenaAnswered({outcome}: ArenaEvalInput): EvalScore {
  if (outcome.status === "created") {
    return createdScore(outcome.arena);
  }

  if (outcome.status === "invalid") {
    return invalidScore(outcome.arena, outcome.reason);
  }

  return {key: KEY, score: 0, comment: `the request ended ${outcome.status}, not created or invalid`};
}

function createdScore(arena: unknown): EvalScore {
  if (arena === undefined) {
    return {key: KEY, score: 0, comment: "the request ended created but carries no arena"};
  }

  return {key: KEY, score: 1};
}

function invalidScore(arena: unknown, reason: string | undefined): EvalScore {
  if (arena !== undefined) {
    return {key: KEY, score: 0, comment: "the request ended invalid but still carries an arena (a substitute)"};
  }

  if (reason === undefined || reason.trim() === "") {
    return {key: KEY, score: 0, comment: "the request ended invalid with no reason for the player"};
  }

  return {key: KEY, score: 1};
}
