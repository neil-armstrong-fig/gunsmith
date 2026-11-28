import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 29 by 17 yard of short walls that turn the way round into a maze, with a cover block at its middle. The walls are
 * placed so that every part is open to the rest, and the picture is the same turned half way round. It has not been played: it
 * may be too easy to lose someone in, which is for play to judge.
 */
export const LABYRINTH_BUILT_IN_ARENA: BuiltInArena = {
  name: "Labyrinth",
  rows: [
    "#############################",
    "#...........................#",
    "#...........................#",
    "#..########.................#",
    "#.........#.................#",
    "#.........#...#########.....#",
    "#.........#.................#",
    "#...#####.#.................#",
    "#.........#...c...#.........#",
    "#.................#.#####...#",
    "#.................#.........#",
    "#.....#########...#.........#",
    "#.................#.........#",
    "#.................########..#",
    "#...........................#",
    "#...........................#",
    "#############################",
  ],
};
