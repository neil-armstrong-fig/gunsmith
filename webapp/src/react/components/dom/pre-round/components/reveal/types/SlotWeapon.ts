import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon and the slot it is carried in, counted from 1. */
export interface SlotWeapon {
  slot: number;
  weapon: Weapon;
}
