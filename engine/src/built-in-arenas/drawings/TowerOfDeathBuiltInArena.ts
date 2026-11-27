import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 27 by 23 yard built round one tower of three storeys at its centre: a round deck one level up and a top two levels up,
 * three tiles square. A stair climbs to the deck from each of the four sides, and one climbs from the deck to the top from each
 * of them too. Round the tower stands a ring of low cover blocks, broken at its four diagonals, and outside that a ring of
 * walls, broken at its four compass points, so the way in turns a corner twice. Both fighters can reach the tower by the same
 * walk, because the picture is the same turned half way round. It has not been played: whether the top is too strong is for
 * play to judge.
 */
export const TOWER_OF_DEATH_BUILT_IN_ARENA: BuiltInArena = {
  name: "Tower of death",
  rows: [
    "###########################",
    "#.........................#",
    "#........###...###........#",
    "#.......#.........#.......#",
    "#......#...........#......#",
    "#.....#...ccccccc...#.....#",
    "#....#....c.....c....#....#",
    "#...#........v........#...#",
    "#...#..cc...111...cc..#...#",
    "#...#..c...11v11...c..#...#",
    "#......c..1122211..c......#",
    "#......c.>1>222<1<.c......#",
    "#......c..1122211..c......#",
    "#...#..c...11^11...c..#...#",
    "#...#..cc...111...cc..#...#",
    "#...#........^........#...#",
    "#....#....c.....c....#....#",
    "#.....#...ccccccc...#.....#",
    "#......#...........#......#",
    "#.......#.........#.......#",
    "#........###...###........#",
    "#.........................#",
    "###########################",
  ],
};
