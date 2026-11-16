import {rateWeaponDraft} from "@gunsmith/ai/pipeline/check/rate/RateWeaponDraft";
import type {
  WeaponGraphStateValues,
  WeaponGraphUpdate,
} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/**
 * The backstop behind `balance`: refuses a weapon still over the engine's damage cap or power budget, in words, and never changes
 * it. A refusal here means the balancing was bypassed, and goes to the one repair like any other. The graph only reaches it after
 * `balance`, so a missing weapon is a fault in the graph, not in the data.
 */
export function rateNode(state: WeaponGraphStateValues): WeaponGraphUpdate {
  const weapon = state.weapon;
  if (!weapon) {
    throw new Error("rate ran before balance had produced a weapon");
  }

  const rating = rateWeaponDraft(weapon);
  if (!rating.ok) {
    return {errors: rating.errors, nodes: ["rate"]};
  }

  return {nodes: ["rate"]};
}
