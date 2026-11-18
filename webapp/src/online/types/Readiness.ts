/** Whether each fighter has asked to go on once a round or a match is decided, as the server tells this seat: its own ask, and the other's. Written out as the server's `Readiness` is, since `api/` is imported by nothing. */
export interface Readiness {
  player: boolean;
  opponent: boolean;
}
