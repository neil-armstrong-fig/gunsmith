import type {WantedArena} from "@src/game/online-pre-round/types/WantedArena";
import type {WantedPick} from "@src/game/online-pre-round/types/WantedPick";
import type {WantedWeapon} from "@src/game/online-pre-round/types/WantedWeapon";

/** One thing the player has locked in that the server does not yet hold, and so is to be sent: a weapon for a slot, the arena, the pick, or the ask to begin the match. */
export type DueAction =
  | {kind: "weapon"; slot: 1 | 2; weapon: WantedWeapon}
  | {kind: "arena"; arena: WantedArena}
  | {kind: "pick"; pick: WantedPick}
  | {kind: "start"};
