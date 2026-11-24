import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";

/** A seat puts a weapon forward for one slot, a built-in by key or a saved one by id, not yet locked in. */
export interface ChooseWeaponAction {
  kind: "chooseWeapon";
  slot: WeaponSlot;
  choice: WeaponChoice;
}
