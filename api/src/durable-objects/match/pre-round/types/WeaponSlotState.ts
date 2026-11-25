import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";

/** One weapon of a seat as the room holds it: what it has put forward (once it has) and whether it is locked in. */
export interface WeaponSlotState {
  chosen?: ChosenWeapon;
  locked: boolean;
}
