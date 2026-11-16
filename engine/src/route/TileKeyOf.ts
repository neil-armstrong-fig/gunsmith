import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A name for the tile a point is on, the same for every point on it. It is made from the tile's own column and row, so a point beyond the arena is never taken for a tile inside it. */
export function tileKeyOf(point: Point): string {
  return `${Math.floor(point.x)},${Math.floor(point.y)}`;
}
