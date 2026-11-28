import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 23 by 13 yard with six solid blocks, three tiles tall and five wide, in two rows, leaving a long lane across the middle
 * and a lane between the two columns of blocks. There is no cover and no height: a corner is what a fighter hides behind, and
 * the lanes are where a fighter is seen from far off. The picture is the same turned half way round. It has not been played: the
 * proportions are for play to judge.
 */
export const CROSSROADS_BUILT_IN_ARENA: BuiltInArena = {
  name: "Crossroads",
  rows: [
    "#######################",
    "#.....................#",
    "#..#####.......#####..#",
    "#..#####.......#####..#",
    "#..#####.......#####..#",
    "#.....................#",
    "#.....................#",
    "#.....................#",
    "#..#####.......#####..#",
    "#..#####.......#####..#",
    "#..#####.......#####..#",
    "#.....................#",
    "#######################",
  ],
};
