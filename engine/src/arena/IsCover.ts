import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/**
 * Whether the tile at (`tileX`, `tileY`) is a low cover block: a solid tile that is not a full wall, since a fighter standing can see
 * and shoot over it. Beyond the arena's edge there is only wall, so it is never cover there.
 */
export function isCover(arena: Arena, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= arena.width || tileY >= arena.height) {
    return false;
  }

  return arena.cover[tileY * arena.width + tileX] === true;
}
