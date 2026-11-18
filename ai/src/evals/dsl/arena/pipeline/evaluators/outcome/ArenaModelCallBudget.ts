import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaModelCallBudget";

/** A request may cost at most the model calls the spec allows; a rejection that needs no model must cost none. */
export function arenaModelCallBudget({outcome}: ArenaEvalInput, maximum: number): EvalScore {
  if (outcome.modelCalls <= maximum) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `${outcome.modelCalls} model calls, allowed ${maximum}`};
}
