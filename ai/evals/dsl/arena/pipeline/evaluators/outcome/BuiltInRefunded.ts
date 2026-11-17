import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "builtInRefunded";

/** The credit goes back exactly when a built-in arena was given instead of the one asked for, and in no other case. */
export function builtInRefunded({outcome}: ArenaEvalInput): EvalScore {
  const owed = outcome.status === "builtIn";
  if (outcome.refunded === owed) {
    return {key: KEY, score: 1};
  }

  if (owed) {
    return {
      key: KEY,
      score: 0,
      comment: "a built-in arena was given instead of the arena asked for, but the credit was not refunded",
    };
  }

  return {key: KEY, score: 0, comment: `the credit was refunded although the request ended ${outcome.status}`};
}
