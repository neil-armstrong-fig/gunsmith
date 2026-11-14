import {ellipseExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/ellipse/EllipseExtent";
import {pointedExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/pointed/PointedExtent";
import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";
import type {AppearancePart} from "@gunsmith/ai/pipeline/appearance/schema/part/AppearancePart";

/** The box round a part's geometry once it is turned, before any stroke. A circle looks the same turned. */
export function bareExtent(part: AppearancePart): Extent {
  if (part.kind === "circle") {
    return {
      minX: part.x - part.radius,
      minY: part.y - part.radius,
      maxX: part.x + part.radius,
      maxY: part.y + part.radius,
    };
  }

  if (part.kind === "ellipse") {
    return ellipseExtent(part);
  }

  return pointedExtent(part);
}
