import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blockedFrom} from "@gunsmith/engine/height/BlockedFrom";

/** The four ways a walker steps from one tile to the next, in the order they are listed in the result, so the same arena always gives the same answer. */
const WALKING_STEPS: readonly Point[] = [
  {x: 1, y: 0},
  {x: -1, y: 0},
  {x: 0, y: 1},
  {x: 0, y: -1},
];

/**
 * The middle of each of the four tiles a walker standing on `tile` can step onto, east, west, north then south. A step is
 * allowed when the walker, standing on the tile they leave, is not blocked from the next (`blockedFrom`): a wall stops them,
 * and so does a drop between levels, and only a stair gets them across it.
 */
export function walkableNeighbours(arena: Arena, tile: Point): readonly Point[] {
  const blocked = blockedFrom(arena, tile);

  return WALKING_STEPS.map(step => {
    return {x: tile.x + step.x, y: tile.y + step.y};
  }).filter(next => {
    return !blocked(Math.floor(next.x), Math.floor(next.y));
  });
}
