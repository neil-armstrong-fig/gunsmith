import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {COVER_REACH_TILES} from "@gunsmith/engine/cover/reach/CoverReach";
import type {ShotTarget} from "@gunsmith/engine/cover/types/ShotTarget";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Whether a crouched `target` is below a bullet flying along `direction` (a vector of length one): a cover block stands right
 * beside them, on the last `COVER_REACH_TILES` of the bullet's straight path to them, the same block that hides them from sight
 * (`coverBesideTarget`). Nobody who stands is shielded. The path is read back from the target, so the bullet carries nothing
 * about where it was fired from.
 */
export function isShieldedByCover(arena: Arena, direction: Point, target: ShotTarget): boolean {
  if (!target.crouching) {
    return false;
  }

  const {position} = target;
  const lastReach = {
    x: position.x - direction.x * COVER_REACH_TILES,
    y: position.y - direction.y * COVER_REACH_TILES,
  };

  return coverBesideTarget(arena, lastReach, position);
}
