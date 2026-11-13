import type {AimLook} from "@gunsmith/engine/opponent/aim/types/AimLook";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";

/**
 * How far, in radians, a burst turns away from the player (positive is to the left). The widest it can be is
 * `widestAimError`, as the opponent first sights the player; it settles in a straight line to `narrowestAimError` over
 * `aimSettleSeconds` of unbroken sight, so a player who ducks out of sight and back gets a moment before it is sharp
 * again. The roll is drawn once per burst, not per step: a jitter drawn every step would average out to a perfect aim.
 */
export function aimErrorFor(look: AimLook): number {
  const settled = Math.min(1, look.seenSeconds / DIFFICULTY.aimSettleSeconds);
  const widest = DIFFICULTY.widestAimError + (DIFFICULTY.narrowestAimError - DIFFICULTY.widestAimError) * settled;

  return look.roll * widest;
}
