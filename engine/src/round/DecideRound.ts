import type {RoundHealth} from "@gunsmith/engine/round/types/RoundHealth";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * Who has won, from the health on each side. When both fall in the same step the round is drawn and nobody scores (the
 * user's rule: a shot that lands on both is nobody's win). The player at zero with the opponent standing loses; the
 * opponent at zero, with the player standing, is a win. With no opponent there is nobody to beat or to draw with, so the
 * round only ends if the player falls.
 */
export function decideRound(health: RoundHealth): RoundState {
  const {playerHealth, opponentHealth} = health;
  const opponentFell = opponentHealth !== undefined && opponentHealth <= 0;
  if (playerHealth <= 0 && opponentFell) {
    return "drawn";
  }

  if (playerHealth <= 0) {
    return "lost";
  }

  if (opponentFell) {
    return "won";
  }

  return "playing";
}
