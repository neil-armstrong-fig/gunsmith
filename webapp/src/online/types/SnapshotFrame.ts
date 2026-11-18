import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";

/** What the server sends many times a second: exactly what this seat may know of the match (`viewOfSeat`), how far its inputs have been played, and the word that names the frame. */
export interface SnapshotFrame extends SeatView {
  kind: "snapshot";
  /** Absent until the server has received this seat's first input. */
  ack?: InputAck | undefined;
}
