import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";

const ARENA = arenaFrom([
  "################",
  "#...11112222222#",
  "#...11112222222#",
  "#..>111>2222222#",
  "#...11112222222#",
  "#...11112222222#",
  "################",
]);

/** Starts on the highest terrace, looking down across both stairs and all three floors. */
export function terrainPreview(): World {
  const world = engine.startingWorld(ARENA);

  return {...world, player: {...world.player, position: {x: 10.5, y: 3.5}, aim: {x: -1, y: 0}}};
}
