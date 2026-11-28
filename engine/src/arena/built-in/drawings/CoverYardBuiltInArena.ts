import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 24 by 14 yard of open ground with eight low cover blocks, two tiles wide, scattered so that a crouched fighter is never far
 * from one. Nothing is higher than the ground and no wall stands inside, so the fight is about who ducks behind what. The
 * picture is the same turned half way round, so each fighter has the cover the other has. It has not been played: the spacing is
 * for play to judge.
 */
export const COVER_YARD_BUILT_IN_ARENA: BuiltInArena = {
  name: "Cover yard",
  rows: [
    "########################",
    "#......................#",
    "#..cc...........cc.....#",
    "#......................#",
    "#........cc............#",
    "#......................#",
    "#.....cc...........cc..#",
    "#..cc...........cc.....#",
    "#......................#",
    "#............cc........#",
    "#......................#",
    "#.....cc...........cc..#",
    "#......................#",
    "########################",
  ],
};
