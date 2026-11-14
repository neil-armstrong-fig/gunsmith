import {ROUNDS_TO_WIN} from "@gunsmith/engine/match/winning/RoundsToWin";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {MatchState} from "@gunsmith/engine/match/types/MatchState";

/**
 * Who has won the match: the first side to win `ROUNDS_TO_WIN` rounds. Both cannot reach it in one round, so the order
 * only makes the function total.
 */
export function decideMatch(match: Match): MatchState {
  if (match.playerWins >= ROUNDS_TO_WIN) {
    return "won";
  }

  if (match.opponentWins >= ROUNDS_TO_WIN) {
    return "lost";
  }

  return "playing";
}
