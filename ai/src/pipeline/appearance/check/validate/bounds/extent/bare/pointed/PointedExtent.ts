import {outlinePoints} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/pointed/outline/OutlinePoints";
import {rotatePoint} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/pointed/rotation/RotatePoint";
import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";
import type {PointedPart} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/pointed/types/PointedPart";

/** The box round a rectangle, polygon or polyline once it is turned about its own `x` and `y`, before any stroke. */
export function pointedExtent(part: PointedPart): Extent {
  const corners = outlinePoints(part).map(point => rotatePoint(point, part.rotation));

  return {
    minX: part.x + Math.min(...corners.map(corner => corner[0])),
    minY: part.y + Math.min(...corners.map(corner => corner[1])),
    maxX: part.x + Math.max(...corners.map(corner => corner[0])),
    maxY: part.y + Math.max(...corners.map(corner => corner[1])),
  };
}
