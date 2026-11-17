import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {tilesReachableFrom} from "@gunsmith/engine/route/TilesReachableFrom";

// The middle of a tile, which is where a walker stands to be counted on it.
const TILE_MIDDLE = 0.5;

/**
 * Every problem with an arena the engine could read, as a sentence for the model to fix. INTERIM: engine is building the real
 * validator (`validateArena`, `HANDOFF.md`), and this is replaced by it in this one file. Until then it holds to the two rules the
 * game cannot play without: there is open floor, and all of it is one region a walker can cross (stairs included), so the two
 * fighters can reach each other wherever they start.
 */
export function arenaProblems(arena: Arena): string[] {
  const open = [...arena.solid.keys()].filter(index => !arena.solid[index]);
  const first = open[0];
  if (first === undefined) {
    return ["The arena has no open floor: every tile is a wall."];
  }

  const start = {x: (first % arena.width) + TILE_MIDDLE, y: Math.floor(first / arena.width) + TILE_MIDDLE};
  const reachable = tilesReachableFrom(arena, start).length;
  if (reachable < open.length) {
    return [
      `The open floor is cut into separate parts: only ${reachable} of its ${open.length} tiles can be walked to from one another. Join them with floor or a stair.`,
    ];
  }

  return [];
}
