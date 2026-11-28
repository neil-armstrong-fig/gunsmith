import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The hand-drawn arena for a duel across levels. Low ground fills the west, ten tiles wide, and a platform one level up fills the
 * rest of the east, reached by one stair at the top of the low ground (column 10, the row nearest the north wall; everywhere
 * else the platform's edge is a drop). The player starts in the middle (tile 12, 3), which is on the platform, so an opponent on the
 * low ground cannot see them until it has climbed. The proportions are placeholders to set by play.
 */
export const TERRACED_ARENA = arenaFrom([
  "#########################",
  "#.........>1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#########################",
]);
