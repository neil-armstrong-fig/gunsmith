import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/**
 * What `checkWeaponDraft` answers: a weapon that is valid and within the cap, or the plain sentences saying why not. Either way it
 * carries the nodes that ran, so the outcome can show the path.
 */
export type WeaponCheck =
  {ok: true; weapon: WeaponDraft; nodes: string[]} | {ok: false; errors: string[]; nodes: string[]};
