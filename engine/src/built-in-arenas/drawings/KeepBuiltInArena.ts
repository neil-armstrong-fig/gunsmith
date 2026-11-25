import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 31 by 19 yard with a walled compound at its centre, thirteen tiles by nine, with a gate three wide in its west wall and
 * another in its east wall and cover blocks inside, and open ground round it with cover in two corners. A fighter can hold the
 * courtyard or go round it. The picture is the same turned half way round. It has not been played: the size of the compound is for
 * play to judge.
 */
export const KEEP_BUILT_IN_ARENA: BuiltInArena = {
  name: "Keep",
  rows: [
    "###############################",
    "#.............................#",
    "#.............................#",
    "#...cc........................#",
    "#...c.........................#",
    "#........#############........#",
    "#........#...........#........#",
    "#........#..c.....c..#........#",
    "#.............................#",
    "#..............c..............#",
    "#.............................#",
    "#........#..c.....c..#........#",
    "#........#...........#........#",
    "#........#############........#",
    "#.........................c...#",
    "#........................cc...#",
    "#.............................#",
    "#.............................#",
    "###############################",
  ],
};
