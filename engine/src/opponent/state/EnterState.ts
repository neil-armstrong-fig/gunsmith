import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";

/**
 * The brain as it is on the first step of a new state: the time in the state starts again, the opponent is no longer
 * standing at a goal, and the state's own memory is reset. Searching starts with the place the player was last seen as its
 * goal; engaging starts between bursts with the reaction delay to wait out; every other state starts with no goal. What it
 * knows about the player (`lastSeen`, `seenSeconds`) and the seed carry over.
 */
export function enterState(brain: OpponentBrain, state: OpponentState): OpponentBrain {
  return {
    ...brain,
    state,
    secondsInState: 0,
    idleSeconds: 0,
    goal: goalOnEntering(brain, state),
    reactionRemainingSeconds: DIFFICULTY.reactionSeconds,
    fireRemainingSeconds: 0,
    restRemainingSeconds: 0,
  };
}

function goalOnEntering(brain: OpponentBrain, state: OpponentState): Point | undefined {
  if (state === "search") {
    return brain.lastSeen;
  }

  return undefined;
}
