import type {LimitRange} from "@gunsmith/ai/pipeline/arena/limits/types/LimitRange";

/** The floor and cap of every limit a generated arena is held to. */
export interface ArenaLimitRanges {
  /** How many characters the arena's name may have. */
  nameLength: LimitRange;
  /** How many rows the drawing may have. */
  rows: LimitRange;
  /** How many characters each row of the drawing may have, and so how wide the arena is. */
  columns: LimitRange;
}
