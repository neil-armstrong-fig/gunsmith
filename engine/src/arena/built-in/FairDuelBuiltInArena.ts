import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * Fixture A of art's fairness study (`docs/art/arena-fairness-research.md`): 21 by 13 tiles, a platform one level up in the
 * middle with a stair on each of its west and east ends climbing towards it, and two walls in opposite corners of the room. The
 * picture is the same turned half way round, so whichever matching pair of places the fighters start on, each has the ground the
 * other has, the platform equally near. It has not been played: the proportions are for play to judge.
 */
export const FAIR_DUEL_BUILT_IN_ARENA: BuiltInArena = {
  name: "Fair duel",
  rows: [
    "#####################",
    "#...................#",
    "#...................#",
    "#...............#...#",
    "#.......11111...#...#",
    "#.......11111.......#",
    "#......>11111<......#",
    "#.......11111.......#",
    "#...#...11111.......#",
    "#...#...............#",
    "#...................#",
    "#...................#",
    "#####################",
  ],
};
