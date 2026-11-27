import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealedWeaponNumbers";

/** The numbers the reveal shows for each side's weapons, in slot order. */
export interface RevealNumbers {
  yours: RevealedWeaponNumbers[];
  opponent: RevealedWeaponNumbers[];
}
