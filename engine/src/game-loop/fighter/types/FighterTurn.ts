import type {Player} from "@gunsmith/engine/player/types/Player";
import type {TriggerRefusal} from "@gunsmith/engine/weapon/types/TriggerRefusal";

/** A fighter after the part of a step that is theirs alone: switched, reloaded, walked and turned, with the trigger judged. */
export interface FighterTurn {
  fighter: Player;
  /** Whether a shot leaves the weapon this step. The caller flies the bullets first, then lets it go and spends the round. */
  fires: boolean;
  /** Why a shot that was due did not leave: the magazine was empty. Absent when it fired or was only waiting. */
  refusal?: TriggerRefusal | undefined;
}
