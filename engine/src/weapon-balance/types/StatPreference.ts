import type {StatName} from "@gunsmith/engine/power-rating/types/StatName";

/** What a player's words say about where a weapon's strength should go. Both lists empty means no preference. */
export interface StatPreference {
  /** The stats the player wants high. */
  favoured: StatName[];
  /** The stats the player would give up, to be low. A stat in both lists counts as neither. */
  sacrificed: StatName[];
}
