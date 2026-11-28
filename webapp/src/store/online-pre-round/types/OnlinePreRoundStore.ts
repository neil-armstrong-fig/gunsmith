import type {OnlinePreRoundReadout} from "@src/game/online-pre-round/types/OnlinePreRoundReadout";
import type {OnlinePreRoundWants} from "@src/game/online-pre-round/types/OnlinePreRoundWants";
import type {WantedArena} from "@src/game/online-pre-round/types/WantedArena";
import type {WantedPick} from "@src/game/online-pre-round/types/WantedPick";
import type {WantedWeapon} from "@src/game/online-pre-round/types/WantedWeapon";

/**
 * Everything the room's pre-round holds: what the server last said of it, and what the player has locked in. The loop writes the readout (only
 * when it changes) and sends what is wanted for as long as the server does not hold it; the dialog writes the wants.
 */
export interface OnlinePreRoundStore {
  /** What the server last said of the pre-round; absent before it says anything and once the match has begun. */
  readout: OnlinePreRoundReadout | undefined;
  wants: OnlinePreRoundWants;
  /** Writes what the server said. The same object stays when nothing changed, so a reader that compares by identity does not run again; none at all ends the pre-round and forgets the wants. */
  setReadout: (readout: OnlinePreRoundReadout | undefined) => void;
  /** Locks in this weapon (a built-in or a saved one) for the slot: the loop sends it until the server holds it. */
  wantWeapon: (slot: 1 | 2, weapon: WantedWeapon) => void;
  /** Locks in this arena, a built-in or a saved one. */
  wantArena: (arena: WantedArena) => void;
  wantPick: (pick: WantedPick) => void;
  /** Asks to begin the match while the decided arena and weapons are shown. */
  wantToStart: () => void;
}
