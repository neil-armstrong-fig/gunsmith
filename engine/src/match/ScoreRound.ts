import type {Match} from "@gunsmith/engine/match/types/Match";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * The match once a round has ended: a won round is the player's, a lost one the opponent's, and one still being fought
 * or drawn (both fell in the same step) is nobody's.
 */
export function scoreRound(match: Match, round: RoundState): Match {
  if (round === "won") {
    return {...match, playerWins: match.playerWins + 1};
  }

  if (round === "lost") {
    return {...match, opponentWins: match.opponentWins + 1};
  }

  return match;
}
