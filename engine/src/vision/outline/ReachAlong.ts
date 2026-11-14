import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import type {Ray} from "@gunsmith/engine/bullet/flight/types/Ray";

/** `distanceToWall` finds a wall to within this: the spacing of its samples. */
const SAMPLE_SPACING = 0.1;
/** Halving the last sample's gap this many times pins the wall's face to a few ten-thousandths of a tile. */
const HALVINGS = 8;

/**
 * How far along `ray` a line of sight gets before it meets a wall's face, or `range` when it meets none. The sampled
 * search finds a wall only to within a sample, so the face is then found by halving the gap, which keeps the edge of what
 * is drawn on the wall instead of a little inside it.
 */
export function reachAlong(arena: Arena, ray: Ray, range: number): number {
  const found = distanceToWall(arena, ray, range);
  if (found === undefined) {
    return range;
  }

  let clear = Math.max(0, found - SAMPLE_SPACING);
  let solid = found;
  for (let halving = 0; halving < HALVINGS; halving += 1) {
    const middle = (clear + solid) / 2;
    if (solidAt(arena, ray, middle)) {
      solid = middle;
    } else {
      clear = middle;
    }
  }

  return clear;
}

function solidAt(arena: Arena, ray: Ray, travelled: number): boolean {
  const x = ray.position.x + ray.direction.x * travelled;
  const y = ray.position.y + ray.direction.y * travelled;

  return isSolid(arena, Math.floor(x), Math.floor(y));
}
