import {startMatch} from "@gunsmith/engine/match/StartMatch";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {sparring} from "@gunsmith/engine/game-loop/step/testing/Sparring";

// A match in its first round, the opponent still and unarmed, or armed and in a fight.
export function sparringMatch(): World {
  return {...sparring(), match: startMatch()};
}
