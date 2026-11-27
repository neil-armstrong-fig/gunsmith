import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";

/**
 * The other seat's saved weapon in a slot, with its numbers and drawing, told to a seat once when both have locked in that slot (and again if
 * it comes back before the match begins), so it can weigh it before choosing its next. The `preRound` frame names it alone. Never an id.
 */
export interface OpponentWeaponMessage {
  kind: "opponentWeapon";
  slot: WeaponSlot;
  weapon: Weapon;
  appearance: Appearance;
}
