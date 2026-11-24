import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";

/** A seat locks in the weapon it has chosen for one slot. */
export interface LockInWeaponAction {
  kind: "lockInWeapon";
  slot: WeaponSlot;
}
