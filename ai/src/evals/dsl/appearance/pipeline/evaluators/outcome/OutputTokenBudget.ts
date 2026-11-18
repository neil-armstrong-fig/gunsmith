import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "outputTokenBudget";

/** The model may write no more than this many tokens in all its calls for one request (what it is sent is not counted). */
export function outputTokenBudget({outcome}: AppearanceEvalInput, maximumOutputTokens: number): EvalScore {
  if (outcome.usage.outputTokens <= maximumOutputTokens) {
    return {key: KEY, score: 1};
  }

  return {
    key: KEY,
    score: 0,
    comment: `${outcome.usage.outputTokens} output tokens, allowed ${maximumOutputTokens}`,
  };
}
