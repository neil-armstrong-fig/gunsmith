import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Player} from "@gunsmith/engine/player/types/Player";

/** What the opponent works from in one step: the arena, itself, the player it fights, whether it sees them, and the step's length. */
export interface OpponentContext {
  arena: Arena;
  opponent: Player;
  /** The player the opponent is fighting. */
  target: Player;
  /** Whether the opponent can see the target: within sight range, with no wall between them. */
  sees: boolean;
  seconds: number;
}
