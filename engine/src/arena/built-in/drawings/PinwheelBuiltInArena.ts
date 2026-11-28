import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 21 by 21 yard of four wall blades turned about a cover block at its centre, each blade seven tiles long, so every
 * lane bends round the next one. There is no cover to duck behind and no height: a fighter is hidden by a corner, and the way
 * round is a loop that either can take. The picture is the same turned a quarter and half way round. It has not been played:
 * the length of the blades is for play to judge.
 */
export const PINWHEEL_BUILT_IN_ARENA: BuiltInArena = {
  name: "Pinwheel",
  rows: [
    "#####################",
    "#...................#",
    "#..........#........#",
    "#..........#........#",
    "#..........#........#",
    "#..........#........#",
    "#..........#........#",
    "#..........#........#",
    "#..........#........#",
    "#.#######...........#",
    "#.........c.........#",
    "#...........#######.#",
    "#........#..........#",
    "#........#..........#",
    "#........#..........#",
    "#........#..........#",
    "#........#..........#",
    "#........#..........#",
    "#........#..........#",
    "#...................#",
    "#####################",
  ],
};
