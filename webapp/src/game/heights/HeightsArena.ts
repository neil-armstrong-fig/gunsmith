import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The hand-drawn arena for trying heights. The player starts in the middle (tile 8, 3) on the low ground. A platform one level up
 * fills the east end from column 10, and one stair, on the player's row at column 9, climbs onto it; everywhere else the platform's
 * edge is a drop. A second platform on the same level fills the north-west corner (tiles x 1 to 3, y 4 and 5), with a stair
 * climbing west onto it at tile (4, 4), so there is the same level to see across the low ground, and a low cover block on the low ground
 * at the foot of it, at tile (4, 5), which hides nobody up on the platform. Landings of one tile at each end
 * of a stair, and a stair one tile wide, are placeholders to set by play.
 */
export const HEIGHTS_ARENA = arenaFrom([
  "################",
  "#111c.....11111#",
  "#111<.....11111#",
  "#........>11111#",
  "#.........11111#",
  "#.........11111#",
  "################",
]);
