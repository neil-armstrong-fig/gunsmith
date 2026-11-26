import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 32 by 15 yard with a watchtower of three storeys at each end: a deck one level up, seven tiles square, with a top two
 * levels up, three tiles square, in its middle. A stair climbs to the deck from the north and the south of each tower, and one
 * climbs from the deck to the top. Between the towers, two lines of low cover blocks, with a gap in each, are the trenches, and
 * a block stands at the centre. The two towers are the same picture turned half way round, so whoever holds one, the other
 * fighter has the matching one. It has not been played: the proportions and whether a top is too strong are for play to judge.
 */
export const WATCHTOWER_BUILT_IN_ARENA: BuiltInArena = {
  name: "Watchtower",
  rows: [
    "################################",
    "#..............................#",
    "#...........c......c...........#",
    "#....v......c......c......v....#",
    "#.1111111...c......c...1111111.#",
    "#.1111111...c......c...1111111.#",
    "#.1222111......cc......1112221.#",
    "#.1222<11......cc......11>2221.#",
    "#.1222111......cc......1112221.#",
    "#.1111111...c......c...1111111.#",
    "#.1111111...c......c...1111111.#",
    "#....^......c......c......^....#",
    "#...........c......c...........#",
    "#..............................#",
    "################################",
  ],
};
