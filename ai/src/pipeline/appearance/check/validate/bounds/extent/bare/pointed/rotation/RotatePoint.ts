import type {AppearancePoint} from "@gunsmith/ai/pipeline/appearance/schema/part/point/AppearancePoint";

/** Turns a point about the origin by `degrees`, clockwise on a screen whose y runs down (as SVG's `rotate` does). */
export function rotatePoint(point: AppearancePoint, degrees: number): AppearancePoint {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  return [point[0] * cosine - point[1] * sine, point[0] * sine + point[1] * cosine];
}
