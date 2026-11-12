import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The hand-drawn arena for the duel. The player starts in the middle (tile 10, 5) and the opponent stands at the east end
 * of the same row, which is clear floor all the way: neither pillar nor wall stands between them. Pillars north and
 * south of that row give both sides something to be walked around.
 */
export const DUEL_ARENA = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "####################",
]);
