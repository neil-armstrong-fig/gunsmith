import type {OnlinePreRoundReadout} from "@src/game/online-pre-round/types/OnlinePreRoundReadout";
import type {OnlinePreRoundWants} from "@src/game/online-pre-round/types/OnlinePreRoundWants";

/** What decides what must be sent again: the server's word, what the player has locked in, and how long ago it was last sent. */
export interface SendsDueRequest {
  readout: OnlinePreRoundReadout;
  wants: OnlinePreRoundWants;
  /** The real seconds since something was last sent, as the last answer said. */
  secondsSinceSend: number;
  /** The real seconds the frame just drawn took. */
  frameSeconds: number;
}
