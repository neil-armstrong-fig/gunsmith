import type {ArenaLimitRanges} from "@gunsmith/engine/arena-limits/types/ArenaLimitRanges";

/**
 * How big an arena in the built-in pool, or one a model draws, may be. Tunables, to be set by play: the numbers are the ones ai
 * used before engine owned them, and they bracket the drawn play arenas (20 by 12 and 21 by 13). A scenario's own fixture is not
 * held to them (the overwatch corridor is 48 by 3), and `validateArena` does not ask. Wall density and one-tile corridors are not
 * limited yet.
 */
export const ARENA_LIMITS: ArenaLimitRanges = {
  width: {min: 8, max: 40},
  height: {min: 5, max: 30},
};
