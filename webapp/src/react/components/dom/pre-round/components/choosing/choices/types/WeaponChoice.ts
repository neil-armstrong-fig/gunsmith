import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon the pre-round offers: a built-in or one from the shelf, with what tells it from the others. */
export interface WeaponChoice {
  /** The built-in's key, or the shelf's id. */
  id: string;
  weapon: Weapon;
}
