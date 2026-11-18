import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "drawnByTheModel";

/**
 * The player is shown the model's own drawing, not the plain stand-in, and the model was asked to repair it at most this many times.
 * The repairs are counted from the steps that ran, not read off the status, so a pipeline that repaired more than it says is caught.
 * Code completing what the model left out is not a repair: no repair was asked of the model.
 */
export function drawnByTheModel({outcome}: AppearanceEvalInput, maximumRepairs: number): EvalScore {
  if (outcome.status === "fallback") {
    return {key: KEY, score: 0, comment: "the plain stand-in was shown, not the model's own drawing"};
  }

  const repairs = outcome.nodes.filter(node => node === "repair").length;
  if (repairs > maximumRepairs) {
    return {key: KEY, score: 0, comment: `repair ran ${repairs} times, allowed ${maximumRepairs}`};
  }

  return {key: KEY, score: 1};
}
