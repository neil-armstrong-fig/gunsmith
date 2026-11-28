import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 24 by 14 yard with a platform one level up in the north-west corner and another in the south-east, each five tiles wide
 * and three deep with a stair on the side that faces the middle, and a low cover block, two tiles square, at the centre.
 * Each fighter can climb to a platform, and neither platform is nearer one fighter than the other, because the picture is the
 * same turned half way round. It has not been played: whether a platform is too strong is for play to judge (the high-ground
 * question in MVP-TODO.md).
 */
export const TWIN_RIDGES_BUILT_IN_ARENA: BuiltInArena = {
  name: "Twin ridges",
  rows: [
    "########################",
    "#......................#",
    "#.11111................#",
    "#.11111<...............#",
    "#.11111................#",
    "#......................#",
    "#..........cc..........#",
    "#..........cc..........#",
    "#......................#",
    "#................11111.#",
    "#...............>11111.#",
    "#................11111.#",
    "#......................#",
    "########################",
  ],
};
