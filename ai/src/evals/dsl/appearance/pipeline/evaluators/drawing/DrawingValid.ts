import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";
import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";

const KEY = "drawingValid";

/** What the player is shown must pass the strict schema, the budgets and the bounds. The evaluator checks it again itself rather than trusting the pipeline's type. */
export function drawingValid({outcome}: AppearanceEvalInput): EvalScore {
  const validation = validateAppearance(outcome.appearance);
  if (validation.ok) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: validation.errors.join("; ")};
}
