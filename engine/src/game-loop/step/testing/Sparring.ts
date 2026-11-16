import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";

// The opponent stands four tiles east of the player on the same row, in the open. A sparring opponent has no rounds and
// no reserve, so it can be shot at without shooting back.
export function sparring(): World {
  return disarmOpponent(startingWorld(arena, [], {x: 11.5, y: 4.5}));
}
