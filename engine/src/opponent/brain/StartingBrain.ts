import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import type {BrainStart} from "@gunsmith/engine/opponent/brain/types/BrainStart";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/**
 * The brain an opponent begins a match with: wandering, remembering nothing, with its reaction delay waiting for the
 * first time it sees the player. Plain data, so the world that holds it can be copied, compared and replayed.
 */
export function startingBrain(start: BrainStart): OpponentBrain {
  return {
    state: "wander",
    seed: start.seed,
    secondsInState: 0,
    seenSeconds: 0,
    reactionRemainingSeconds: DIFFICULTY.reactionSeconds,
    fireRemainingSeconds: 0,
    restRemainingSeconds: 0,
    aimRoll: 0,
    strafeSide: 1,
    strafeRemainingSeconds: 0,
    idleSeconds: 0,
    stuckWatch: {anchor: start.position, seconds: 0},
  };
}
