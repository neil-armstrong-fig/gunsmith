import {FIRE_INTERVAL_SECONDS} from "@gunsmith/engine/weapon/firing/FireInterval";
import type {TriggerResult} from "@gunsmith/engine/weapon/types/TriggerResult";

/**
 * One step of the trigger: the weapon cools by `seconds`, and if it is held down and the weapon is ready, a shot leaves
 * and the cool-down starts over. Holding the trigger therefore fires at a steady rate, not once per step.
 */
export function pullTrigger(cooldownSeconds: number, firing: boolean, seconds: number): TriggerResult {
  const remaining = Math.max(0, cooldownSeconds - seconds);

  if (firing && remaining === 0) {
    return {fires: true, cooldownSeconds: FIRE_INTERVAL_SECONDS};
  }

  return {fires: false, cooldownSeconds: remaining};
}
