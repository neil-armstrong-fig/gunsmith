import type {RevealReadout} from "@src/game/online-pre-round/types/RevealReadout";
import type {RevealFrame} from "@src/online/types/RevealFrame";

/** The reveal made from a reveal frame, kept with the frame it was made from so it is made once and stays the same object while that frame is the latest. */
export interface MadeReveal {
  frame: RevealFrame | undefined;
  readout: RevealReadout | undefined;
}
