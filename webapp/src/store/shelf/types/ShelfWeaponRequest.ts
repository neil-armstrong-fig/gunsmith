import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** What a player asks the shelf to keep: a made weapon and the words that made it. */
export interface ShelfWeaponRequest {
  prompt: string;
  weapon: Weapon;
}
