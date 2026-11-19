/** How long a room waits for a player before the round is forfeited, in seconds of play. */
export interface ForfeitLimits {
  /** How long a seat whose person has left is kept for them to come back. */
  reconnectSeconds: number;
  /** How long a seat whose person is there may ask for nothing new. */
  idleSeconds: number;
}
