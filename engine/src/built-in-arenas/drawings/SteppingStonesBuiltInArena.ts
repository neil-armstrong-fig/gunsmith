import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 29 by 19 yard with four small platforms, one level up and three tiles square, one in each corner area, each with a
 * stair on the side that faces the middle, and a plus of cover blocks at the centre. A platform is a perch with nothing to hide
 * behind. The picture is the same turned half way round. It has not been played: whether a perch is worth the climb is for play
 * to judge.
 */
export const STEPPING_STONES_BUILT_IN_ARENA: BuiltInArena = {
  name: "Stepping stones",
  rows: [
    "#############################",
    "#...........................#",
    "#...........................#",
    "#...111...............111...#",
    "#...111<.............>111...#",
    "#...111...............111...#",
    "#...........................#",
    "#...........................#",
    "#.............c.............#",
    "#............ccc............#",
    "#.............c.............#",
    "#...........................#",
    "#...........................#",
    "#...111...............111...#",
    "#...111<.............>111...#",
    "#...111...............111...#",
    "#...........................#",
    "#...........................#",
    "#############################",
  ],
};
