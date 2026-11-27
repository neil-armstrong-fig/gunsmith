import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/**
 * A 31 by 17 arena of two chambers joined by a neck seven tiles long and three wide, with a cover block in the middle
 * of the neck that leaves a lane on each side of it, and cover blocks in the chambers near the neck's mouths. The way from one
 * chamber to the other is the neck, so a fight is over who comes through it. The picture is the same turned half way round. It
 * has not been played: the width of the neck is for play to judge.
 */
export const HOURGLASS_BUILT_IN_ARENA: BuiltInArena = {
  name: "Hourglass",
  rows: [
    "###############################",
    "#...........#######...........#",
    "#...........#######...........#",
    "#...........#######...........#",
    "#...........#######...........#",
    "#........c..#######..c........#",
    "#...........#######...........#",
    "#.............................#",
    "#....c.........c.........c....#",
    "#.............................#",
    "#...........#######...........#",
    "#........c..#######..c........#",
    "#...........#######...........#",
    "#...........#######...........#",
    "#...........#######...........#",
    "#...........#######...........#",
    "###############################",
  ],
};
