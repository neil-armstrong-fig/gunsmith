import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 25 by 17 hill built in steps: a deck one level up, thirteen tiles by eleven, and a top two levels up, seven by five, in its
 * middle. A stair climbs to the deck from the west and from the east, and one climbs from the deck to the top on each side, so
 * both fighters have the same way up. Three cover blocks in the corners are the only cover on the low ground. It is a hill to
 * be held, and a fighter on the top sees all of it. The picture is the same turned half way round. It has not been played:
 * whether the top is too strong is for play to judge.
 */
export const ZIGGURAT_BUILT_IN_ARENA: BuiltInArena = {
  name: "Ziggurat",
  rows: [
    "#########################",
    "#.......................#",
    "#.cc....................#",
    "#.c...1111111111111.....#",
    "#.....1111111111111.....#",
    "#.....1111111111111.....#",
    "#.....1112222222111.....#",
    "#.....1112222222111.....#",
    "#....>11>2222222<11<....#",
    "#.....1112222222111.....#",
    "#.....1112222222111.....#",
    "#.....1111111111111.....#",
    "#.....1111111111111.....#",
    "#.....1111111111111...c.#",
    "#....................cc.#",
    "#.......................#",
    "#########################",
  ],
};
