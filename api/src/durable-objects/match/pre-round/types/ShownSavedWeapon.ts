import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";

/** A saved weapon of the other seat that a seat may now be shown, with the numbers and drawing its page does not have. Never its id. */
export interface ShownSavedWeapon {
  slot: WeaponSlot;
  weapon: Weapon;
  appearance: Appearance;
}
