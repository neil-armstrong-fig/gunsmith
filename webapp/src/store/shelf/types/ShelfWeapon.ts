import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon kept on the shelf, with the words it was made from. */
export interface ShelfWeapon {
  /** Tells this weapon from every other on the shelf, even two made from the same words. Given when the weapon is saved. */
  id: string;
  /** The prompt that made the weapon, kept as it was when Make was pressed. */
  prompt: string;
  weapon: Weapon;
}
