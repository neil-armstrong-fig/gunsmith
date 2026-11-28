import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** How much of the arena is open floor, from 0 to 1: the tiles that are not solid over every tile. A cover block is solid, so it counts as wall. */
export function floorShareOf(arena: Arena): number {
  const tiles = arena.width * arena.height;
  if (tiles === 0) {
    return 0;
  }

  return arena.solid.filter(solid => !solid).length / tiles;
}
