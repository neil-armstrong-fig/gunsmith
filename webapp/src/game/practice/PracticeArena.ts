import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The hand-drawn arena for the practice range, until arenas are made by players. The middle row and column are clear
 * from the player's start to every outer wall; four pillars give the walls something to be walked around.
 */
export const PRACTICE_ARENA = arenaFrom([
  "########################",
  "#......................#",
  "#......................#",
  "#...##..............##.#",
  "#...##..............##.#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#.##..............##...#",
  "#.##..............##...#",
  "#......................#",
  "#......................#",
  "########################",
]);
