import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "appearanceCallBudget";

/** A request may cost no more than this many model calls. */
export function appearanceCallBudget({outcome}: AppearanceEvalInput, maximumModelCalls: number): EvalScore {
  if (outcome.modelCalls <= maximumModelCalls) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `${outcome.modelCalls} model calls, allowed ${maximumModelCalls}`};
}
