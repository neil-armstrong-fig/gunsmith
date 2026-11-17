import type {PointedPart} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/pointed/types/PointedPart";
import type {AppearancePoint} from "@gunsmith/shared/appearance/schema/part/point/AppearancePoint";

/** The corners of a part made of straight edges, local to the part's own `x` and `y`: a rectangle's four, or the points it lists. */
export function outlinePoints(part: PointedPart): AppearancePoint[] {
  if (part.kind === "rect") {
    return [
      [0, 0],
      [part.width, 0],
      [part.width, part.height],
      [0, part.height],
    ];
  }

  return part.points;
}
