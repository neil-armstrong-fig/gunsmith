import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 29 by 15 yard with a bridge across its middle: a strip of floor one level up, fifteen tiles long and three wide, with
 * a stair at each end. It looks over everything, and a fighter on it has no cover, since cover stands on the low ground only.
 * A few cover blocks stand on the ground to either side. The picture is the same turned half way round. It has not been
 * played: whether the bridge is a way across or a trap is for play to judge.
 */
export const CATWALK_BUILT_IN_ARENA: BuiltInArena = {
  name: "Catwalk",
  rows: [
    "#############################",
    "#...........................#",
    "#...........................#",
    "#........cc..ccc............#",
    "#...c.......................#",
    "#...c.......................#",
    "#......111111111111111......#",
    "#.....>111111111111111<.....#",
    "#......111111111111111......#",
    "#.......................c...#",
    "#.......................c...#",
    "#............ccc..cc........#",
    "#...........................#",
    "#...........................#",
    "#############################",
  ],
};
