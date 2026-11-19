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
 *
 * Given a `goal`, the search stops once the tile it stands on has been found and the search from the tile that found it is
 * done. A tile keeps the `cameFrom` it was first given, so the way back from the goal is the same one the whole search would
 * give, ties included; the map is cut short, so it holds only the tiles found by then and is no list of where a walker can go.
 * A goal nobody can reach is never found, so that search covers every tile, as it does with no goal.
 */
export function walkingRoutesFrom(arena: Arena, start: Point, goal?: Point): ReadonlyMap<string, WalkStep> {
  const first: Point = {x: Math.floor(start.x) + 0.5, y: Math.floor(start.y) + 0.5};
  const routes = new Map<string, WalkStep>([[tileKeyOf(first), {tile: first, cameFrom: undefined}]]);
  const goalKey = goal && tileKeyOf(goal);

  // A map visits the entries added while it is being walked, so each tile found is searched from in its turn.
  for (const step of routes.values()) {
    if (goalKey !== undefined && routes.has(goalKey)) {
      break;
    }

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
