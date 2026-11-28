/** A player picked one of the arenas submitted: their own or their opponent's. */
export interface PickedArena {
  kind: "arena";
  /** The `playerId` of the submission this player picked. */
  chosenPlayerId: string;
}
