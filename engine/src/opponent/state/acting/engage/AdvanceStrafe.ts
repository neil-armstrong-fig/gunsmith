import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {oppositeSide} from "@gunsmith/engine/opponent/steering/OppositeSide";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

/**
 * Counts down the time on this side of the player. When it runs out the opponent changes sides and draws how long to hold
 * the new one, between `strafeMinSeconds` and `strafeMaxSeconds`, so it cannot be led by a pattern.
 */
export function advanceStrafe(brain: OpponentBrain, seconds: number): OpponentBrain {
  const remaining = brain.strafeRemainingSeconds - seconds;
  if (remaining > 0) {
    return {...brain, strafeRemainingSeconds: remaining};
  }

  const draw = nextRandom(brain.seed);

  return {
    ...brain,
    seed: draw.seed,
    strafeSide: oppositeSide(brain.strafeSide),
    strafeRemainingSeconds:
      DIFFICULTY.strafeMinSeconds + draw.value * (DIFFICULTY.strafeMaxSeconds - DIFFICULTY.strafeMinSeconds),
  };
}
