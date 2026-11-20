import type {ArenaHow} from "@src/online/types/pre-round/ArenaHow";
import type {OpponentPreRound} from "@src/online/types/pre-round/OpponentPreRound";
import type {OwnPreRound} from "@src/online/types/pre-round/OwnPreRound";
import type {PreRoundStage} from "@src/online/types/pre-round/PreRoundStage";

/**
 * What the server sends each tick while the two seats are choosing their arena, from that seat's side: the stage, the seconds left (absent
 * until both have sat and the clock runs), its own choices and what it may see of the other's. Written out as `api/` writes it.
 */
export interface PreRoundFrame {
  kind: "preRound";
  stage: PreRoundStage;
  secondsLeft?: number;
  own: OwnPreRound;
  opponent: OpponentPreRound;
  how?: ArenaHow;
}
