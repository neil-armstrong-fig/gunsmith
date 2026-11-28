import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import type {StatPreference} from "@gunsmith/engine/weapon/balance/types/StatPreference";

/**
 * What `validateWeaponDraft` answers: the weapon, parsed, with the player's stat preference beside it (empty when the model gave
 * none), or one plain sentence for each thing wrong with the answer, each short enough to hand to `repair`.
 */
export type WeaponValidation =
  {ok: true; weapon: WeaponDraft; preference: StatPreference} | {ok: false; errors: string[]};
