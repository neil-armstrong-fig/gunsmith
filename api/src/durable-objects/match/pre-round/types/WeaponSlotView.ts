import type {WeaponView} from "@src/durable-objects/match/pre-round/types/WeaponView";

/** One weapon as a seat is told it: whether it is locked in, and the weapon itself when that seat may know it. */
export interface WeaponSlotView {
  locked: boolean;
  choice?: WeaponView;
}
