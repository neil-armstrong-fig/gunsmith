import type {EllipsePart} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/bare/ellipse/types/EllipsePart";
import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";

/** The box round an ellipse turned about its own centre, before any stroke (the exact half-extents of a rotated ellipse). */
export function ellipseExtent(part: EllipsePart): Extent {
  const radians = (part.rotation * Math.PI) / 180;
  const halfWidth = Math.hypot(part.radiusX * Math.cos(radians), part.radiusY * Math.sin(radians));
  const halfHeight = Math.hypot(part.radiusX * Math.sin(radians), part.radiusY * Math.cos(radians));

  return {minX: part.x - halfWidth, minY: part.y - halfHeight, maxX: part.x + halfWidth, maxY: part.y + halfHeight};
}
