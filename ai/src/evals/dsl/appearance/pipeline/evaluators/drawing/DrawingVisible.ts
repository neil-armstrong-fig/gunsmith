import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";
import {partExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/PartExtent";
import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";

const KEY = "drawingVisible";

/** The narrowest drawn width, in design units, that reads as a weapon along the aim (`art`'s 64 px body shows a 40 to 52 unit weapon). A tunable. */
const MINIMUM_DRAWN_WIDTH = 20;

/**
 * Something is drawn, and wide enough to read along the aim. A proxy for "not blank" only: whether the drawing looks like what was
 * asked for is for a person to judge. A drawing that is not valid has nothing to measure (`drawingValid` says so).
 */
export function drawingVisible({outcome}: AppearanceEvalInput): EvalScore {
  const validation = validateAppearance(outcome.appearance);
  if (!validation.ok) {
    return {key: KEY, score: 1, comment: "not valid, nothing to measure"};
  }

  const drawn = validation.appearance.body.filter(part => part.fill !== "none" || part.stroke !== "none");
  if (drawn.length === 0) {
    return {key: KEY, score: 0, comment: "nothing in the drawing is drawn: every fill and stroke is none"};
  }

  const extents = drawn.map(partExtent);
  const width = Math.max(...extents.map(extent => extent.maxX)) - Math.min(...extents.map(extent => extent.minX));
  if (width < MINIMUM_DRAWN_WIDTH) {
    return {
      key: KEY,
      score: 0,
      comment: `the drawing is ${Number(width.toFixed(2))} wide, under the ${MINIMUM_DRAWN_WIDTH} it needs to read along the aim`,
    };
  }

  return {key: KEY, score: 1};
}
