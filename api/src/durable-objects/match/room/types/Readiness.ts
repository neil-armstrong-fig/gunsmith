/** Whether each fighter has asked to go on once a round or a match is decided, from the side of the seat being told: its own ask, and the other's. */
export interface Readiness {
  player: boolean;
  opponent: boolean;
}
