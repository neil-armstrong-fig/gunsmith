import type {RevealReadout} from "@src/game/online-pre-round/types/RevealReadout";
import type {OnlinePreRoundStage} from "@src/game/online-pre-round/types/OnlinePreRoundStage";
import type {SeatReadout} from "@src/game/online-pre-round/types/SeatReadout";

/** What the server says of the room's pre-round, as far as the screen needs it, written by the loop whenever it changes. */
export interface OnlinePreRoundReadout {
  stage: OnlinePreRoundStage;
  /** The whole seconds left (to choose, then to look at what was decided), or nothing while the other player has not sat: the clock starts at their seat. */
  secondsLeft: number | undefined;
  /** The built-in arenas the room offers today, in the pool's order: the only built-ins a player may put forward. */
  builtInArenas: readonly string[];
  own: SeatReadout;
  opponent: SeatReadout;
  /** How the arena was settled, once it was. */
  how: string | undefined;
  /** What was decided, once the server has said it. */
  reveal: RevealReadout | undefined;
}
