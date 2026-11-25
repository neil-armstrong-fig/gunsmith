import type {WantedArena} from "@src/game/room-pre-round/types/WantedArena";
import type {WantedPick} from "@src/game/room-pre-round/types/WantedPick";
import type {WantedWeapon} from "@src/game/room-pre-round/types/WantedWeapon";

/** What the player has locked in, step by step, for the loop to send until the server holds it: the weapon for slot 1 and for slot 2 and the arena (each a built-in or one of their saved items), the pick, and whether they asked to begin the match. */
export interface RoomWants {
  weapons: readonly [WantedWeapon | undefined, WantedWeapon | undefined];
  arena: WantedArena | undefined;
  pick: WantedPick | undefined;
  start: boolean;
}
