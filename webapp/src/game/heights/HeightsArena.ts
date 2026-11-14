import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The hand-drawn arena for trying heights. The player starts in the middle (tile 8, 3) on the low ground. A platform one level up
 * fills the east end from column 10, and one stair, on the player's row at column 9, climbs onto it; everywhere else the platform's
 * edge is a drop. Landings of one tile at each end of the stair, and a stair one tile wide, are placeholders to set by play.
 */
export const HEIGHTS_ARENA = arenaFrom([
  "################",
  "#.........11111#",
  "#.........11111#",
  "#........>11111#",
  "#.........11111#",
  "#.........11111#",
  "################",
]);
