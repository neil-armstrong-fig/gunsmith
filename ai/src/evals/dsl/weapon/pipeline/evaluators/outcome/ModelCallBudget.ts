import type {WeaponEvalInput} from "@evals/dsl/weapon/pipeline/types/WeaponEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "modelCallBudget";

/** A request may cost at most the model calls the spec allows; a rejection that needs no model must cost none. */
export function modelCallBudget({outcome}: WeaponEvalInput, maximum: number): EvalScore {
  if (outcome.modelCalls <= maximum) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `${outcome.modelCalls} model calls, allowed ${maximum}`};
}
