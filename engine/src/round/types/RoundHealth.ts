/** The health that decides a round. The opponent is absent in a world that has none, such as the practice range. */
export interface RoundHealth {
  playerHealth: number;
  opponentHealth: number | undefined;
}
