import type {ShownWeapon} from "@src/game/online-pre-round/types/ShownWeapon";

/** One weapon of a seat as the page shows it: whether it is locked in, and the weapon itself once this page may know it. */
export interface SlotReadout {
  locked: boolean;
  shown: ShownWeapon | undefined;
}
