import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

const KEY = "arenaOutcomeMatches";

/** Did the pipeline end the way the spec says it should: an arena created, the request rejected, or a built-in arena given? */
export function arenaOutcomeMatches({outcome}: ArenaEvalInput, expected: ArenaOutcomeStatus): EvalScore {
  if (outcome.status === expected) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `expected ${expected}, got ${outcome.status}`};
}
