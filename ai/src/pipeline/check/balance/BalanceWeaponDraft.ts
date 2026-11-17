import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";
import {balanceWeapon} from "@gunsmith/engine/weapon-balance/BalanceWeapon";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";

/**
 * Brings a valid weapon inside the engine's limits by taking from its stats where the player's preference says, and hands back the
 * weapon with its name. The AI proposes the stats it infers from the request and the player's preference; the engine disposes.
 * Never makes a stat stronger, and a weapon already inside the limits comes back as it was. No model is called.
 */
export function balanceWeaponDraft(weapon: WeaponDraft, preference: StatPreference): WeaponDraft {
  return {name: weapon.name, ...balanceWeapon({stats: weapon, preference})};
}
