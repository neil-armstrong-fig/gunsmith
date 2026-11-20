import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {WeaponToIterate} from "@src/store/workshop/types/WeaponToIterate";

/**
 * Everything the workshop's store holds: what the player has written and the last weapon made from it. It lives apart from the panel
 * so that shutting the workshop (to try the weapon, or to walk) and opening it again finds the prompt and the result as they were.
 */
export interface WorkshopStore {
  /** What is written in the prompt box, kept as it is even when it is too long to make. */
  prompt: string;
  /** The weapon the last Make gave, or nothing before the first. */
  weapon: Weapon | undefined;
  /** The words the card's weapon was made from: what the box held when Make was pressed, whatever it holds now. What Save keeps with the weapon. */
  madeFromPrompt: string;
  /** The id the card's weapon is saved under on the shelf, or nothing when it is not saved. Cleared by a new Make. The card is saved only while the shelf still has this id. */
  savedId: string | undefined;
  setPrompt: (prompt: string) => void;
  /** Makes `weapon` the card's: it is made from the words now in the box, and is not saved. */
  setWeapon: (weapon: Weapon) => void;
  setSavedId: (id: string | undefined) => void;
  /** Brings a saved weapon back to iterate on: its words in the box and as the words it was made from, its weapon on the card, saved under its id. */
  showSavedWeapon: (saved: WeaponToIterate) => void;
}
