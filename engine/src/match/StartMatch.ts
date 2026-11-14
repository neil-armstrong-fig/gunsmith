import type {Match} from "@gunsmith/engine/match/types/Match";

/** A match that has just begun: nothing won by either side, and the first round to fight. */
export function startMatch(): Match {
  return {playerWins: 0, opponentWins: 0, roundNumber: 1};
}
