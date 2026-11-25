import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {RoomWants} from "@src/game/room-pre-round/types/RoomWants";
import type {WantedArena} from "@src/game/room-pre-round/types/WantedArena";
import type {WantedPick} from "@src/game/room-pre-round/types/WantedPick";
import type {WantedWeapon} from "@src/game/room-pre-round/types/WantedWeapon";

/**
 * Everything the room's pre-round holds: what the server last said of it, and what the player has locked in. The loop writes the readout (only
 * when it changes) and sends what is wanted for as long as the server does not hold it; the dialog writes the wants.
 */
export interface RoomPreRoundStore {
  /** What the server last said of the pre-round; absent before it says anything and once the match has begun. */
  readout: RoomPreRoundReadout | undefined;
  wants: RoomWants;
  /** Writes what the server said. The same object stays when nothing changed, so a reader that compares by identity does not run again; none at all ends the pre-round and forgets the wants. */
  setReadout: (readout: RoomPreRoundReadout | undefined) => void;
  /** Locks in this weapon (a built-in or a saved one) for the slot: the loop sends it until the server holds it. */
  wantWeapon: (slot: 1 | 2, weapon: WantedWeapon) => void;
  /** Locks in this arena, a built-in or a saved one. */
  wantArena: (arena: WantedArena) => void;
  wantPick: (pick: WantedPick) => void;
  /** Asks to begin the match while the decided arena and weapons are shown. */
  wantToStart: () => void;
}
