import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";
import type {PreRoundPhase} from "@src/store/pre-round/types/PreRoundPhase";

/**
 * Everything the pre-round's store holds: where the pre-round stands and what the player locked in. While it is not `"fighting"` the game waits.
 * The match carries `picks` into every round; "Play again" puts the pre-round back.
 */
export interface PreRoundStore {
  phase: PreRoundPhase;
  /** The weapons locked in, from locking in until the next pre-round; absent before that. */
  picks: PreRoundPicks | undefined;
  /** Locks in the picks and shows the reveal. */
  lockIn: (picks: PreRoundPicks) => void;
  /** Ends the reveal: the match begins. */
  startMatch: () => void;
  /** Puts the pre-round back for a new match, with nothing locked in, when the page asked for one; on any other page there is nothing to put back. */
  restart: () => void;
}
