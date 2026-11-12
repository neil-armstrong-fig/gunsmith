import type {TriggerRequest} from "@gunsmith/engine/weapon/types/TriggerRequest";
import type {TriggerResult} from "@gunsmith/engine/weapon/types/TriggerResult";

/**
 * One step of the trigger: the weapon cools by `seconds`, and if it is held down, the weapon is ready, loaded and not
 * being reloaded, a shot leaves and the cool-down starts over. Holding the trigger therefore fires at a steady rate, not
 * once per step. The caller spends the round.
 */
export function pullTrigger(request: TriggerRequest): TriggerResult {
  const {cooldownSeconds, firing, seconds, fireIntervalSeconds, rounds, reloading} = request;
  const remaining = Math.max(0, cooldownSeconds - seconds);

  if (firing && remaining === 0 && rounds > 0 && !reloading) {
    return {fires: true, cooldownSeconds: fireIntervalSeconds};
  }

  return {fires: false, cooldownSeconds: remaining};
}
