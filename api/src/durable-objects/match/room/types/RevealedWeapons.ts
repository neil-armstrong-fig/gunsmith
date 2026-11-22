import type {RevealedWeapon} from "@src/durable-objects/match/room/types/RevealedWeapon";

/** The weapons each side carries into the match, slot 1 then slot 2, as the receiving seat is told them. */
export interface RevealedWeapons {
  own: readonly [RevealedWeapon, RevealedWeapon];
  opponent: readonly [RevealedWeapon, RevealedWeapon];
}
