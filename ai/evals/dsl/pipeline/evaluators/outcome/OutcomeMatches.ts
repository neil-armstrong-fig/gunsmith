import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/pipeline/types/EvalScore";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

const KEY = "outcomeMatches";

/** Did the pipeline end the way the spec says it should: a weapon created, or the request rejected? */
export function outcomeMatches({outcome}: EvalInput, expected: WeaponOutcomeStatus): EvalScore {
  if (outcome.status === expected) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `expected ${expected}, got ${outcome.status}`};
}
