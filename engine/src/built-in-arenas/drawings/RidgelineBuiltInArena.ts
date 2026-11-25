import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 33 by 15 yard with a long ridge one level up along the north and another along the south, each twenty-one tiles by
 * three, with a stair at each end, and open low ground between them with a few cover blocks. A ridge looks over the middle
 * and has no cover, so it is a way to see rather than a place to stay. The picture is the same turned half way round. It has
 * not been played: the length of the ridges is for play to judge.
 */
export const RIDGELINE_BUILT_IN_ARENA: BuiltInArena = {
  name: "Ridgeline",
  rows: [
    "#################################",
    "#...............................#",
    "#.....111111111111111111111.....#",
    "#....>111111111111111111111<....#",
    "#.....111111111111111111111.....#",
    "#...............c...............#",
    "#...............................#",
    "#...........cc.....cc...........#",
    "#...............................#",
    "#...............c...............#",
    "#.....111111111111111111111.....#",
    "#....>111111111111111111111<....#",
    "#.....111111111111111111111.....#",
    "#...............................#",
    "#################################",
  ],
};
