/** A vote for the arena that `seat` put forward. */
export interface PickedSeatArena {
  kind: "arena";
  seat: "first" | "second";
}
