import type {RevealReadout} from "@src/game/online-pre-round/types/RevealReadout";
import type {OnlinePreRoundReadout} from "@src/game/online-pre-round/types/OnlinePreRoundReadout";
import type {OpponentWeapons} from "@src/online/types/OpponentWeapons";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";

/** What the readout is made of: the server's last frame of the pre-round, and the reveal made from its reveal frame when it has sent one. */
export interface ReadoutRequest {
  frame: PreRoundFrame;
  reveal: RevealReadout | undefined;
  /** The readout made from an earlier frame, whose weapons are kept while the server shows the same ones. */
  previous?: OnlinePreRoundReadout;
  /** The other player's saved weapons with their numbers and drawings, as the server told them once each. */
  opponentWeapons?: OpponentWeapons;
}
