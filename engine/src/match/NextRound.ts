import type {Match} from "@gunsmith/engine/match/types/Match";

/** The match as the next round begins: the score stays, the round number goes up by one. */
export function nextRound(match: Match): Match {
  return {...match, roundNumber: match.roundNumber + 1};
}
