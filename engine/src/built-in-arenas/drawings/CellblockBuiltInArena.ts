import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 29 by 21 block of four rooms, laid in two rows of two. Each room has two doors, one on its side wall and one on its end
 * wall, so that the doors lead round the four rooms in a loop, and each room has a pair of cover blocks. Fights are across
 * a room or through a door. The picture is the same turned half way round. It has not been played: the size of the rooms is for
 * play to judge.
 */
export const CELLBLOCK_BUILT_IN_ARENA: BuiltInArena = {
  name: "Cellblock",
  rows: [
    "#############################",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#......cc...........cc......#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "######.###############.######",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#......cc...........cc......#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#.............#.............#",
    "#############################",
  ],
};
