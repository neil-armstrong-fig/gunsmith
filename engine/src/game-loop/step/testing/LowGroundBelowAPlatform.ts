import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

// Low ground in the west and a platform one level up in the east, joined by one stair at the north end of the drop: the picture
// of the webapp's terraced arena. Nothing on the low ground sees more than a tile onto the platform, so a fighter back from its
// edge is out of sight.
export const lowGroundBelowAPlatform = arenaFrom([
  "#########################",
  "#.........>1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#########################",
]);
