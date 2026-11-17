import {balanceWeaponDraft} from "@gunsmith/ai/pipeline/check/balance/BalanceWeaponDraft";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphUpdate";

/**
 * Brings the weapon inside the engine's limits by the player's preference (the engine's `balanceWeapon`, which never makes a stat
 * stronger): the AI proposes, the engine disposes. It cannot refuse, so it has no way out of the graph. The graph only reaches it
 * after `validate` has passed, so a missing candidate is a fault in the graph, not in the data.
 */
export function balanceNode(state: WeaponGraphStateValues): WeaponGraphUpdate {
  const candidate = state.candidate;
  if (!candidate) {
    throw new Error("balance ran before validate had passed");
  }

  return {weapon: balanceWeaponDraft(candidate.weapon, candidate.preference), nodes: ["balance"]};
}
