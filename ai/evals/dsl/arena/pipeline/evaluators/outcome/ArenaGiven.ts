import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "arenaGiven";

/** A request that was asked for properly ends with an arena the player can play, the model's own or a built-in one, never with nothing. */
export function arenaGiven({outcome}: ArenaEvalInput): EvalScore {
  if (outcome.status !== "rejected" && outcome.arena !== undefined) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `no arena was given: the request ended ${outcome.status}`};
}
