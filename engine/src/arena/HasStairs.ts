import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** Whether the arena has a stair anywhere, which is the only thing that lets a walker cross a drop between levels. */
export function hasStairs(arena: Arena): boolean {
  return arena.stairs.some(stair => {
    return stair !== undefined;
  });
}
