import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/**
 * What `validateWeaponDraft` answers: the weapon, parsed, or one plain sentence for each thing wrong with the answer, each short
 * enough to hand to `repair`.
 */
export type WeaponValidation = {ok: true; weapon: WeaponDraft} | {ok: false; errors: string[]};
