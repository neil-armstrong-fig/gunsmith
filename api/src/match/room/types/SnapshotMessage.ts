import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";

/** What a seat is sent every snapshot: exactly what the engine says it may know (`viewOfSeat`), how far its inputs have been played, and the word that names the frame. */
export interface SnapshotMessage extends SeatView {
  kind: "snapshot";
  /** Absent until the seat has sent its first input. */
  ack?: InputAck | undefined;
}
