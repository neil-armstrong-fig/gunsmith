import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * A 21 by 13 bowl: a rim one level up, two tiles wide, all the way round, and a low court in its middle, fifteen tiles by seven, with a
 * stair down from the middle of each side and low cover in the court: a block at each corner and a bar of three at the centre. A
 * fighter on the rim sees down into the court and one in the court cannot see up, so the court is watched from every side; the ring
 * closing on it brings fighters down by a stair. The reverse of Ziggurat, chosen by the user (2026-11-26) from the "ring with stairs"
 * experiment in `docs/art/gameplay-research.md`. The picture is the same turned half way round. It has not been played: whether the
 * rim is too strong is for play to judge.
 */
export const SUNKEN_COURT_BUILT_IN_ARENA: BuiltInArena = {
  name: "Sunken court",
  rows: [
    "#####################",
    "#1111111111111111111#",
    "#1111111111111111111#",
    "#11.......^.......11#",
    "#11..c.........c..11#",
    "#11...............11#",
    "#11<.....ccc.....>11#",
    "#11...............11#",
    "#11..c.........c..11#",
    "#11.......v.......11#",
    "#1111111111111111111#",
    "#1111111111111111111#",
    "#####################",
  ],
};
