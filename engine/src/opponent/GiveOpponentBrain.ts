import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startingBrain} from "@gunsmith/engine/opponent/StartingBrain";

/**
 * The same world with its opponent given a brain, which plays it: a world's opponent without one takes no action at all
 * (the still target of sparring), so a match that wants a fighter asks for one here. The seed is the one the match's
 * every choice is drawn from; the caller picks it, since the engine has no `Math.random`. A world with no opponent
 * comes back as it is.
 */
export function giveOpponentBrain(world: World, seed: number): World {
  const {opponent} = world;
  if (!opponent) {
    return world;
  }

  return {...world, opponentBrain: startingBrain({seed, position: opponent.position})};
}
