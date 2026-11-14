/** How a best-of-three stands: the rounds each side has won, and which round is being fought (the first is 1). */
export interface Match {
  playerWins: number;
  opponentWins: number;
  roundNumber: number;
}
