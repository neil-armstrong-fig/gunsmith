/** The round's closing ring as the game reports it. */
export interface RingSnapshot {
  /** The seconds of the round still to be played before the ring starts to close; 0 once it has started. Falls only while the round is fought. */
  secondsUntilStart: number;
}
