import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";
import type {PreRoundPhase} from "@src/store/pre-round/types/PreRoundPhase";

/**
 * Everything the pre-round's store holds: where the pre-round stands, what the player locked in and the arena the match is played on. While it is not `"fighting"` the game waits.
 * The match carries `picks` and `arena` into every round; "Play again" puts the pre-round back. The bot puts nothing forward and picks nothing, so the player's arena is the arena.
 */
export interface PreRoundStore {
  phase: PreRoundPhase;
  /** The weapons locked in, from locking in until the next pre-round; absent before that. */
  picks: PreRoundPicks | undefined;
  /** The arena locked in, from locking in until the next pre-round; absent before that. */
  arena: OfferedArena | undefined;
  /** Locks in the weapons and the arena and shows the reveal. */
  lockIn: (picks: PreRoundPicks, arena: OfferedArena) => void;
  /** Ends the reveal: the match begins. */
  startMatch: () => void;
  /** Puts the pre-round back for a new match, with nothing locked in, when the page asked for one; on any other page there is nothing to put back. */
  restart: () => void;
}
