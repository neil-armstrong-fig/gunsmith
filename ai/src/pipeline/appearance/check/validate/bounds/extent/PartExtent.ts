import {bareExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/BareExtent";
import {strokeReach} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/stroke/StrokeReach";
import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";
import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";

/**
 * The box a part covers once it is turned and stroked, in the design space. This is what must sit inside the space, not the
 * coordinates the model wrote: a rectangle at x 30 that is turned a quarter swings its length down the page. A circle or ellipse
 * turns about its centre, every other part about its own `x` and `y`.
 */
export function partExtent(part: AppearancePart): Extent {
  const reach = strokeReach(part);
  const bare = bareExtent(part);

  return {minX: bare.minX - reach, minY: bare.minY - reach, maxX: bare.maxX + reach, maxY: bare.maxY + reach};
}
