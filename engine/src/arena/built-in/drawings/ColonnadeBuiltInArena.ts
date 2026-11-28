import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 27 by 15 hall of pillars: two rows of single wall pillars, which stop sight, with a row of low cover blocks between
 * them, evenly spaced, so a fighter is never more than a step from a corner to peek round or a block to duck behind. There is no
 * height. The picture is the same turned half way round. It has not been played: the spacing is for play to judge.
 */
export const COLONNADE_BUILT_IN_ARENA: BuiltInArena = {
  name: "Colonnade",
  rows: [
    "###########################",
    "#.........................#",
    "#.........................#",
    "#..#...#...#...#...#...#..#",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "#..c...c...c...c...c...c..#",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "#..#...#...#...#...#...#..#",
    "#.........................#",
    "#.........................#",
    "###########################",
  ],
};
