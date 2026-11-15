import {drawingValid} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingValid";
import {standInDisclosed} from "@evals/dsl/appearance/pipeline/evaluators/drawing/StandInDisclosed";
import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

const KEY = "drawnWhenCreated";

/**
 * A weapon that is created is shown with a drawing that passes the strict schema, budgets and bounds, and that is never the plain
 * stand-in passed off as the model's own. A request that was turned away or came out invalid has no weapon, so it has no drawing.
 * The checks on the drawing itself are the appearance evaluators', run again here on the nested outcome rather than trusted.
 */
export function drawnWhenCreated({outcome}: EvalInput): EvalScore {
  if (outcome.status !== "created") {
    return notDrawn(outcome.status, outcome.appearance !== undefined);
  }

  if (outcome.appearance === undefined) {
    return {key: KEY, score: 0, comment: "a created weapon must be drawn, but the outcome has no appearance"};
  }

  const valid = drawingValid({outcome: outcome.appearance});
  if (valid.score === 0) {
    return {key: KEY, score: 0, comment: `the drawing shown is not valid: ${valid.comment ?? "no reason given"}`};
  }

  const disclosed = standInDisclosed({outcome: outcome.appearance});
  if (disclosed.score === 0) {
    return {key: KEY, score: 0, comment: disclosed.comment ?? "the stand-in is not disclosed"};
  }

  return {key: KEY, score: 1};
}

function notDrawn(status: WeaponOutcomeStatus, hasAppearance: boolean): EvalScore {
  if (hasAppearance) {
    return {
      key: KEY,
      score: 0,
      comment: `a request that ended ${status} must not be drawn, but the outcome has an appearance`,
    };
  }

  return {key: KEY, score: 1, comment: `${status}, nothing to draw`};
}
