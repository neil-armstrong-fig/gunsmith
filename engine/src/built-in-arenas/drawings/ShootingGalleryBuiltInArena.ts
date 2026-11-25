import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 40 by 9 hall, as long as an arena may be, with low cover blocks and bars scattered along it and a block, two tiles
 * by three, at the middle. The sight lines are long, so the weapon with the longest reach is worth the most here. The picture is
 * the same turned half way round. It has not been played: the spacing of the cover is for play to judge.
 */
export const SHOOTING_GALLERY_BUILT_IN_ARENA: BuiltInArena = {
  name: "Shooting gallery",
  rows: [
    "########################################",
    "#........c.............................#",
    "#........c..............c..............#",
    "#...c....c.........cc...c..........c...#",
    "#...c..........c...cc...c..........c...#",
    "#...c..........c...cc.........c....c...#",
    "#..............c..............c........#",
    "#.............................c........#",
    "########################################",
  ],
};
