import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * The point to aim at so as to miss `target` by `error` radians: the target turned about the shooter, at the same
 * distance, a positive error to the left of the line to it and a negative one to the right.
 */
export function missedAimPoint(from: Point, target: Point, error: number): Point {
  const offsetX = target.x - from.x;
  const offsetY = target.y - from.y;
  const cos = Math.cos(error);
  const sin = Math.sin(error);

  return {x: from.x + offsetX * cos - offsetY * sin, y: from.y + offsetX * sin + offsetY * cos};
}
