import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import type {WalkStep} from "@gunsmith/engine/route/types/WalkStep";
import {walkableNeighbours} from "@gunsmith/engine/route/walking/WalkableNeighbours";

/**
 * Every tile a walker standing at `start` can walk to, the tile they stand on included, keyed by tile (`tileKeyOf`), each
 * with the tile it was reached from. It is a breadth-first search, so the tiles come out nearest first, in the order the
 * search found them, and following `cameFrom` back from any tile to the start is the shortest way on foot. It keeps nothing
 * between calls.
 */
export function walkingRoutesFrom(arena: Arena, start: Point): ReadonlyMap<string, WalkStep> {
  const first: Point = {x: Math.floor(start.x) + 0.5, y: Math.floor(start.y) + 0.5};
  const routes = new Map<string, WalkStep>([[tileKeyOf(first), {tile: first, cameFrom: undefined}]]);

  // A map visits the entries added while it is being walked, so each tile found is searched from in its turn.
  for (const step of routes.values()) {
    recordNewNeighbours(arena, routes, step.tile);
  }

  return routes;
}

function recordNewNeighbours(arena: Arena, routes: Map<string, WalkStep>, from: Point): void {
  for (const next of walkableNeighbours(arena, from)) {
    if (!routes.has(tileKeyOf(next))) {
      routes.set(tileKeyOf(next), {tile: next, cameFrom: from});
    }
  }
}
