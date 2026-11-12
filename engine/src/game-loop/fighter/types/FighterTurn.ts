import type {Player} from "@gunsmith/engine/player/types/Player";

/** A fighter after the part of a step that is theirs alone: switched, reloaded, walked and turned, with the trigger judged. */
export interface FighterTurn {
  fighter: Player;
  /** Whether a shot leaves the weapon this step. The caller flies the bullets first, then lets it go and spends the round. */
  fires: boolean;
}
