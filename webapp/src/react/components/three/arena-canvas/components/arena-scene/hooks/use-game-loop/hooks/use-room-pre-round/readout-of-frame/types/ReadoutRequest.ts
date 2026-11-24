import type {RevealReadout} from "@src/game/room-pre-round/types/RevealReadout";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";

/** What the readout is made of: the server's last frame of the pre-round, and the reveal made from its reveal frame when it has sent one. */
export interface ReadoutRequest {
  frame: PreRoundFrame;
  reveal: RevealReadout | undefined;
}
