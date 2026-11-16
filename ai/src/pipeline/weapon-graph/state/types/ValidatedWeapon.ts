import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";

/** What `validate` hands to `balance`: the weapon as the model wrote it (parsed, not yet brought inside the limits) and the player's preference. */
export interface ValidatedWeapon {
  weapon: WeaponDraft;
  preference: StatPreference;
}
