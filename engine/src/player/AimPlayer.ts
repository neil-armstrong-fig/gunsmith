import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * The direction a player faces after aiming at `target`: a vector of length one from the player's centre towards it.
 * With no target, or a target exactly on the player (which has no direction), they keep facing the way they were.
 */
export function aimPlayer(previousAim: Point, from: Point, target: Point | undefined): Point {
  if (!target) {
    return previousAim;
  }

  const offsetX = target.x - from.x;
  const offsetY = target.y - from.y;
  const length = Math.hypot(offsetX, offsetY);
  if (length === 0) {
    return previousAim;
  }

  return {x: offsetX / length, y: offsetY / length};
}
