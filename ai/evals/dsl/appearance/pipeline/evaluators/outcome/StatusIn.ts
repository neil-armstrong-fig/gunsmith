import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";
import type {AppearanceOutcomeStatus} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcomeStatus";

const KEY = "statusIn";

/** How the request ended must be one of the statuses given. */
export function statusIn({outcome}: AppearanceEvalInput, allowed: AppearanceOutcomeStatus[]): EvalScore {
  if (allowed.includes(outcome.status)) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `expected ${allowed.join(" or ")}, got ${outcome.status}`};
}
