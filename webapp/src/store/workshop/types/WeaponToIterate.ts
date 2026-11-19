import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A saved weapon brought back into the workshop: what the shelf keeps (its id, its words, its weapon), without the workshop having to know the shelf. */
export interface WeaponToIterate {
  id: string;
  prompt: string;
  weapon: Weapon;
}
