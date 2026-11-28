import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";

/**
 * Open low ground with one low cover block, at (10, 3), and nothing else inside the walls, so the only place to hide from a standing
 * fighter is the tile right behind the block.
 */
const ARENA = arenaFrom([
  "################",
  "#..............#",
  "#..............#",
  "#.........c....#",
  "#..............#",
  "#..............#",
  "################",
]);

/**
 * The cover run, a fixture for a playtest and for specs: the player at (5.5, 3.5) facing east, and the opponent eight tiles east of
 * them on the same row, two tiles past the block, with an empty magazine and a full reserve, so its first thought is to reload,
 * and the block, two tiles away, is the only cover it can reach. It has a brain drawn from `seed`; there is one round, with no ring,
 * dummies or weapon lying about.
 */
export function coverRunWorld(seed: number): World {
  const world = giveOpponentBrain(engine.startingWorld(ARENA, [], {x: 13.5, y: 3.5}), seed);
  const {opponent} = world;
  if (!opponent) {
    return world;
  }

  const loadout = opponent.loadout.map((carried, index) => {
    if (index === opponent.equippedIndex) {
      return {...carried, rounds: 0};
    }

    return carried;
  });

  return {
    ...world,
    player: {...world.player, position: {x: 5.5, y: 3.5}, aim: {x: 1, y: 0}},
    opponent: {...opponent, loadout},
  };
}
