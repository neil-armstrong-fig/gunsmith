import type {RevealedWeapon} from "@src/online/types/RevealedWeapon";

/** The two weapons each side carries into the match, slot 1 then slot 2, from this seat's side. */
export interface RevealedWeapons {
  own: readonly [RevealedWeapon, RevealedWeapon];
  opponent: readonly [RevealedWeapon, RevealedWeapon];
}
