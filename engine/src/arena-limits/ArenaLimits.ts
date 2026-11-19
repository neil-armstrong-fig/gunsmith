import type {ArenaLimitRanges} from "@gunsmith/engine/arena-limits/types/ArenaLimitRanges";

/**
 * How big an arena in the built-in pool, or one a model draws, may be. Tunables, to be set by play: the numbers are the ones ai
 * used before engine owned them, and they bracket the drawn play arenas (20 by 12 and 21 by 13). A scenario's own fixture is not
 * held to them (the overwatch corridor is 48 by 3), and `validateArena` does not ask about size. It does ask about the floor share
 * (`tooWalled`), a guess at how little open floor still leaves room to fight: Duel is 68% and Fair duel 75%. A maze of one-tile
 * passages is allowed.
 */
export const ARENA_LIMITS: ArenaLimitRanges = {
  width: {min: 8, max: 40},
  height: {min: 5, max: 30},
  floorShare: {min: 0.25, max: 1},
};
