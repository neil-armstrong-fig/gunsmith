import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";

/** What the server sends about 20 times a second: exactly what this seat may know of the match (`viewOfSeat`), and the word that names the frame. */
export interface SnapshotFrame extends SeatView {
  kind: "snapshot";
}
