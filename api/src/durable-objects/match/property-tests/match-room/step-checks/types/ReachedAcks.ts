import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";

/** Where each seat's input count should stand, worked out from the steps alone; `undefined` for a seat that has sent nothing. */
export type ReachedAcks = Record<Seat, InputAck | undefined>;
