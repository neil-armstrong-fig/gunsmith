import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

// The whole floor one level up, so whoever fires from it fires from level 1.
export const upstairs = arenaFrom([
  "###############",
  ...Array.from({length: 7}, () => "#1111111111111#"),
  "###############",
]);
