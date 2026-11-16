import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blockedFrom} from "@gunsmith/engine/height/BlockedFrom";

const NEIGHBOURS: readonly Point[] = [
  {x: 1, y: 0},
  {x: -1, y: 0},
  {x: 0, y: 1},
  {x: 0, y: -1},
];

/**
 * How many tile-to-tile steps a walker standing at `start` needs to reach every tile they can walk to, keyed by the tile's
 * row-major index (`y * arena.width + x`). A tile they cannot reach has no entry. A step is allowed when the walker, on the
 * tile they leave, is not blocked from the next (`blockedFrom`), so a wall stops them and only a stair gets them across a drop.
 */
export function routeDistancesFrom(arena: Arena, start: Point): ReadonlyMap<number, number> {
  const first: Point = {x: Math.floor(start.x) + 0.5, y: Math.floor(start.y) + 0.5};
  const distances = new Map<number, number>([[indexOf(arena, first), 0]]);
  const queue: Point[] = [first];

  for (let position = 0; position < queue.length; position++) {
    const from = queue[position];
    if (!from) {
      break;
    }

    const stepsToHere = distances.get(indexOf(arena, from)) ?? 0;
    const blocked = blockedFrom(arena, from);
    for (const step of NEIGHBOURS) {
      const next: Point = {x: from.x + step.x, y: from.y + step.y};
      if (blocked(Math.floor(next.x), Math.floor(next.y)) || distances.has(indexOf(arena, next))) {
        continue;
      }

      distances.set(indexOf(arena, next), stepsToHere + 1);
      queue.push(next);
    }
  }

  return distances;
}

function indexOf(arena: Arena, tile: Point): number {
  return Math.floor(tile.y) * arena.width + Math.floor(tile.x);
}
