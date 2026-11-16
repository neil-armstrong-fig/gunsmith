import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";

export function centred(): World {
  return startingWorld(arena);
}
