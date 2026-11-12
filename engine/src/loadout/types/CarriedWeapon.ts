import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon in the player's hands or on their back, with the rounds it has left. */
export interface CarriedWeapon {
  weapon: Weapon;
  /** Rounds in the magazine: what the next shots spend. */
  rounds: number;
  /** Rounds in the reserve: what a reload moves into the magazine. */
  reserve: number;
}
