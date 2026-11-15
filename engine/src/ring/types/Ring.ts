/**
 * The round's closing ring. For now it is only a clock: how many seconds of the round have been played, which runs while
 * the round is being fought and stops when it is decided, so a countdown to the ring's start stops with the round.
 */
export interface Ring {
  roundSeconds: number;
}
