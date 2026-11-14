import type {MatchState} from "@gunsmith/engine/match/types/MatchState";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * The words the banner shows for a round that has ended. When the round ended a match, the match is what is announced;
 * `matchState` is absent when the game is not a match, and "playing" when the match goes on.
 */
export function roundMessage(state: RoundState, matchState: MatchState | undefined): string {
  if (matchState === "won") {
    return "You won the match";
  }

  if (matchState === "lost") {
    return "You lost the match";
  }

  if (state === "won") {
    return "You won";
  }

  return "You lost";
}
