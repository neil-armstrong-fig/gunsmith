import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";

/**
 * Open low ground with two low cover blocks, at (7, 3) and (7, 1), and nothing else inside the walls: the rows at y 5, 4 and 2 have none.
 */
const ARENA = arenaFrom([
  "################",
  "#..............#",
  "#..............#",
  "#......c.......#",
  "#..............#",
  "#......c.......#",
  "################",
]);

/**
 * Where the three dummies stand, in the order the specs name them: east of the player on three rows, each well inside the rifle's
 * reach. The first stands with the block at (7, 3) between it and the player, the second crouches with the block at (7, 1) right
 * beside it on the way, the third crouches in the open on a row with no block, so what hides a dummy is the cover and the stance.
 */
const DUMMIES = [
  {position: {x: 8.5, y: 3.5}, crouching: false},
  {position: {x: 8.5, y: 1.5}, crouching: true},
  {position: {x: 8.5, y: 5.5}, crouching: true},
];

/** The cover arena: the player at (3.5, 3.5) on the low ground facing east, the three dummies, no opponent, ring or weapon lying about. */
export function coverWorld(): World {
  const world = engine.startingWorld(
    ARENA,
    DUMMIES.map(dummy => dummy.position),
  );

  return {
    ...world,
    player: {...world.player, position: {x: 3.5, y: 3.5}, aim: {x: 1, y: 0}},
    dummies: world.dummies.map((dummy, index) => ({...dummy, crouching: DUMMIES[index]?.crouching})),
  };
}
