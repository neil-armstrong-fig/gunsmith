import type {RoundHealth} from "@gunsmith/engine/round/types/RoundHealth";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * Who has won, from the health on each side. The player at zero loses, even when the opponent is at zero too (both fell
 * in the same step); the opponent at zero, with the player standing, is a win. With no opponent there is nobody to beat,
 * so the round only ends if the player falls.
 */
export function decideRound(health: RoundHealth): RoundState {
  const {playerHealth, opponentHealth} = health;
  if (playerHealth <= 0) {
    return "lost";
  }

  if (opponentHealth !== undefined && opponentHealth <= 0) {
    return "won";
  }

  return "playing";
}
