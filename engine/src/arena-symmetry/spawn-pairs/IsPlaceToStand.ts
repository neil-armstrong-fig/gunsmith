import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** Whether the tile at `index` (row-major, `y * arena.width + x`) is somewhere a fighter may start: open floor that is not a stair. */
export function isPlaceToStand(arena: Arena, index: number): boolean {
  return arena.solid[index] === false && arena.stairs[index] === undefined;
}
