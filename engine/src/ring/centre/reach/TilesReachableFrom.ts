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
 * The middle of every tile a walker standing at `start` can walk to, the tile they stand on included, in the order a
 * flood fill finds them. A step from tile to tile is allowed when the walker, standing on the tile they leave, is not
 * blocked from the next (`blockedFrom`), so a wall stops them and a drop between levels does too, and only a stair gets
 * them across it, in either direction.
 */
export function tilesReachableFrom(arena: Arena, start: Point): readonly Point[] {
  const first: Point = {x: Math.floor(start.x) + 0.5, y: Math.floor(start.y) + 0.5};
  const reached: Point[] = [first];
  const seen = new Set<number>([tileKey(arena, first)]);

  for (let index = 0; index < reached.length; index++) {
    const from = reached[index];
    if (!from) {
      break;
    }

    const blocked = blockedFrom(arena, from);
    for (const step of NEIGHBOURS) {
      const next: Point = {x: from.x + step.x, y: from.y + step.y};
      if (blocked(Math.floor(next.x), Math.floor(next.y)) || seen.has(tileKey(arena, next))) {
        continue;
      }

      seen.add(tileKey(arena, next));
      reached.push(next);
    }
  }

  return reached;
}

function tileKey(arena: Arena, tile: Point): number {
  return Math.floor(tile.y) * arena.width + Math.floor(tile.x);
}
