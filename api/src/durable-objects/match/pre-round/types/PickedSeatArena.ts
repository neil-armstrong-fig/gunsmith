import type {Seat} from "@gunsmith/engine/seat/types/Seat";

/** A seat's vote for the arena that `seat` put forward. */
export interface PickedSeatArena {
  kind: "arena";
  seat: Seat;
}
