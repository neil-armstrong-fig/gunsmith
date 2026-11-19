import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the practice dummies stand in `PRACTICE_ARENA`, nearest to farthest: about 3, 6, 9 and 11 tiles from the player's start at 12.5, 7.5
 * (2.8, 5.8, 9.2 and 11.2), so range, spread and damage can be felt. They are on four different bearings (north-east, south-west, east and
 * west), each with a clear line of sight and a clear line of fire from the start, and none stands in the way of another. None is on the row
 * or column through the start, so a shot east, west, north or south from it meets only walls. The farthest is as far as the rifle sees (12)
 * and the pillars let a clear line run; a weapon that sees less (the submachine gun, 9) cannot see the last two, which is its range.
 */
export const PRACTICE_DUMMIES: readonly Point[] = [
  {x: 14.5, y: 5.5},
  {x: 7.5, y: 10.5},
  {x: 21.5, y: 5.5},
  {x: 1.5, y: 5.5},
];
