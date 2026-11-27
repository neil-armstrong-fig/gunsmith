import type {ArenaHow} from "@src/online/types/pre-round/ArenaHow";
import type {OpponentPreRound} from "@src/online/types/pre-round/OpponentPreRound";
import type {OwnPreRound} from "@src/online/types/pre-round/OwnPreRound";
import type {PreRoundStage} from "@src/online/types/pre-round/PreRoundStage";

/**
 * What the server sends each tick while the two seats are choosing their arena, from that seat's side: the stage, the seconds left (absent
 * until both have sat and the clock runs), the built-in arenas the room offers today (the same five to both seats: a built-in outside
 * them is refused, and a seat that chooses nothing gets the first), its own choices and what it may see of the other's. Written out as
 * `api/` writes it.
 */
export interface PreRoundFrame {
  kind: "preRound";
  stage: PreRoundStage;
  builtInArenas: readonly string[];
  secondsLeft?: number;
  own: OwnPreRound;
  opponent: OpponentPreRound;
  how?: ArenaHow;
}
