import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";

const KEY = "standInDisclosed";

/** The plain stand-in is never passed off as the model's own drawing: it is shown exactly when the outcome says fallback. */
export function standInDisclosed({outcome}: AppearanceEvalInput): EvalScore {
  const isStandIn = JSON.stringify(outcome.appearance) === JSON.stringify(fallbackAppearance());
  const saysFallback = outcome.status === "fallback";

  if (isStandIn && !saysFallback) {
    return {
      key: KEY,
      score: 0,
      comment: `the plain stand-in is shown, but the outcome says ${outcome.status}, as if the model had drawn it`,
    };
  }

  if (saysFallback && !isStandIn) {
    return {key: KEY, score: 0, comment: "the outcome says fallback, but the drawing shown is not the stand-in"};
  }

  return {key: KEY, score: 1};
}
