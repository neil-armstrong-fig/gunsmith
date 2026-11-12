import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** Whether the tile at (`tileX`, `tileY`) is a wall. Everything beyond the arena's edge counts as one. */
export function isSolid(arena: Arena, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= arena.width || tileY >= arena.height) {
    return true;
  }

  return arena.solid[tileY * arena.width + tileX] === true;
}
