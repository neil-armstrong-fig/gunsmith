import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";

/** What a seat is sent every snapshot: exactly what the engine says it may know (`viewOfSeat`), and the word that names the frame. */
export interface SnapshotMessage extends SeatView {
  kind: "snapshot";
}
