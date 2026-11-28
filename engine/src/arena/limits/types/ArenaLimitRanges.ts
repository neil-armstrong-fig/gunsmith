import type {LimitRange} from "@gunsmith/engine/arena/limits/types/LimitRange";

/** The floor and cap of every limit an arena in the built-in pool, or one a model draws, is held to. */
export interface ArenaLimitRanges {
  /** How many tiles wide the arena may be: how many characters each row of its drawing has. */
  width: LimitRange;
  /** How many tiles tall the arena may be: how many rows its drawing has. */
  height: LimitRange;
  /** How much of the arena must be open floor, as a share of its tiles from 0 to 1: walls and cover blocks are not floor. */
  floorShare: LimitRange;
}
