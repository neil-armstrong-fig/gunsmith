import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";

/** What `validate` hands to `balance`: the weapon as the model wrote it (parsed, but a stat may be past its range, and it is not yet inside the limits: only `balance` guarantees both) and the player's preference. */
export interface ValidatedWeapon {
  weapon: WeaponDraft;
  preference: StatPreference;
}
