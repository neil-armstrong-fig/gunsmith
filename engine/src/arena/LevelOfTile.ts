import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** Which level the tile at (`tileX`, `tileY`) is on: 0 is the low ground, and a stair has the level of its low end. Beyond the arena's edge it is 0. */
export function levelOfTile(arena: Arena, tileX: number, tileY: number): number {
  if (tileX < 0 || tileY < 0 || tileX >= arena.width || tileY >= arena.height) {
    return 0;
  }

  return arena.levels[tileY * arena.width + tileX] ?? 0;
}
