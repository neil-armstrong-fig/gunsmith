import type {Player} from "@gunsmith/engine/player/types/Player";
import type {World} from "@gunsmith/engine/game-loop/types/World";

export function opponentOf(world: World): Player {
  const {opponent} = world;
  if (!opponent) {
    throw new Error("The world has no opponent.");
  }

  return opponent;
}
