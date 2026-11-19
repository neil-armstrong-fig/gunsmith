import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * Everything the workshop's store holds: what the player has written and the last weapon made from it. It lives apart from the panel
 * so that shutting the workshop (to try the weapon, or to walk) and opening it again finds the prompt and the result as they were.
 */
export interface WorkshopStore {
  /** What is written in the prompt box, kept as it is even when it is too long to make. */
  prompt: string;
  /** The weapon the last Make gave, or nothing before the first. */
  weapon: Weapon | undefined;
  setPrompt: (prompt: string) => void;
  setWeapon: (weapon: Weapon) => void;
}
