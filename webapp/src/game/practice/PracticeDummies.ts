import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the practice dummies stand in `PRACTICE_ARENA`. The player starts at 12.5, 7.5, and none of these is on the row
 * or column through that tile, so a shot east, west, north or south from the start meets only walls. Each has a clear line
 * of sight from the start: no pillar sits between.
 */
export const PRACTICE_DUMMIES: readonly Point[] = [
  {x: 16.5, y: 10.5},
  {x: 8.5, y: 4.5},
  {x: 6.5, y: 10.5},
];
