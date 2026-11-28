import {clampToRanges} from "@gunsmith/ai/pipeline/weapon/check/balance/clamping/ClampToRanges";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import {balanceWeapon} from "@gunsmith/engine/weapon-balance/BalanceWeapon";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";

/**
 * Brings a parsed weapon inside the engine's limits and hands it back with its name: first each stat to the end of its range if the
 * model wrote it past one (`clampToRanges`), then, if the power budget or the damage cap is still passed, by taking from its stats
 * where the player's preference says. The AI proposes the stats it infers from the request and the player's preference; the engine
 * disposes. The balancing never makes a stat stronger, and a weapon already inside its ranges and the limits comes back as it was.
 * No model is called.
 */
export function balanceWeaponDraft(weapon: WeaponDraft, preference: StatPreference): WeaponDraft {
  const inRange = clampToRanges(weapon);

  return {name: inRange.name, ...balanceWeapon({stats: inRange, preference})};
}
