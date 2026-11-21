import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The weapons a seat carries into the match: the one for slot 1 and the one for slot 2. */
export interface WeaponPair {
  first: Weapon;
  second: Weapon;
}
