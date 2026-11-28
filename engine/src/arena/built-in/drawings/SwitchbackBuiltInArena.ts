import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 27 by 15 yard of three strips laid one over the next, joined by an opening at the east end of the first wall and
 * the west end of the second, so that the long way round is an S. A door in each wall at the middle, with a cover block between
 * them, is the short way, a straight line through both doors that the block interrupts. The picture is the same turned half way
 * round. It has not been played: the long walk is a guess for play to judge.
 */
export const SWITCHBACK_BUILT_IN_ARENA: BuiltInArena = {
  name: "Switchback",
  rows: [
    "###########################",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "#############.#########...#",
    "#.........................#",
    "#............c............#",
    "#.........................#",
    "#...#########.#############",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "#.........................#",
    "###########################",
  ],
};
