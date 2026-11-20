/** Sent to both browsers once, when the pre-round has decided the arena the match is played in: its layout, to swap in. */
export interface ArenaMessage {
  kind: "arena";
  rows: readonly string[];
}
