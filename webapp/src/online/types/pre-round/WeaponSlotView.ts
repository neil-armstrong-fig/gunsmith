import type {WeaponView} from "@src/online/types/pre-round/WeaponView";

/** One weapon of a seat as the server says it: whether it is locked in, and the weapon itself when this seat may know it. */
export interface WeaponSlotView {
  locked: boolean;
  choice?: WeaponView;
}
