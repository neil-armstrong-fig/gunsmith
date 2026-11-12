import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

const KEY = "modelCallBudget";

// A request may cost at most the model calls its case allows; a rejection that needs no model must cost none.
export function modelCallBudget({evalCase, outcome}: EvalInput): EvalScore {
  if (outcome.modelCalls <= evalCase.maxModelCalls) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `${outcome.modelCalls} model calls, allowed ${evalCase.maxModelCalls}`};
}
