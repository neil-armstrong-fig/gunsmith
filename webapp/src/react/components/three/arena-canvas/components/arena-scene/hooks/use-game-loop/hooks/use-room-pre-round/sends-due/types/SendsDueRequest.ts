import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {RoomWants} from "@src/game/room-pre-round/types/RoomWants";

/** What decides what must be sent again: the server's word, what the player has locked in, and how long ago it was last sent. */
export interface SendsDueRequest {
  readout: RoomPreRoundReadout;
  wants: RoomWants;
  /** The real seconds since something was last sent, as the last answer said. */
  secondsSinceSend: number;
  /** The real seconds the frame just drawn took. */
  frameSeconds: number;
}
