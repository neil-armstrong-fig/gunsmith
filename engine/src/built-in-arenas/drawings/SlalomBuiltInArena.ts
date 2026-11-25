import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 35 by 13 yard crossed by four walls, two hanging from the north and two rising from the south, in turn, so the way
 * from one end to the other weaves between them, with a few cover blocks in the gaps. A shot along the arena is stopped by the
 * next wall, and a fight is over a gap. The picture is the same turned half way round. It has not been played: the length of the
 * walls is for play to judge.
 */
export const SLALOM_BUILT_IN_ARENA: BuiltInArena = {
  name: "Slalom",
  rows: [
    "###################################",
    "#.......#...........#.............#",
    "#.......#...........#.............#",
    "#.......#...........#..c..........#",
    "#.......#...........#.............#",
    "#.......#.....#.....#.....#.......#",
    "#.......#.....#..c..#.....#.......#",
    "#.......#.....#.....#.....#.......#",
    "#.............#...........#.......#",
    "#..........c..#...........#.......#",
    "#.............#...........#.......#",
    "#.............#...........#.......#",
    "###################################",
  ],
};
