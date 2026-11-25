import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/components/pre-round/types/RevealedWeaponNumbers";

/** The numbers the reveal shows for each side's weapons, in slot order. */
export interface RevealNumbers {
  yours: RevealedWeaponNumbers[];
  opponent: RevealedWeaponNumbers[];
}
