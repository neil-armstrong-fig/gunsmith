import type {HeardEvent} from "@gunsmith/engine/combat-events/types/HeardEvent";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hearSound} from "@gunsmith/engine/sound/hearing/HearSound";
import type {NoiseOfFighter} from "@gunsmith/engine/sound/types/NoiseOfFighter";

/**
 * Everything a listener at `listener` hears of the other fighter in one step, in the order a shot, a footfall and the taking of a
 * weapon: each only if it was made and is within its own range. A pickup is heard from where the weapon lay.
 */
export function heardInStep(listener: Point, noise: NoiseOfFighter): HeardEvent[] {
  const heard: (HeardEvent | undefined)[] = [
    noise.shot ? hearSound(listener, noise.position, "shot") : undefined,
    noise.footfall ? hearSound(listener, noise.position, "step") : undefined,
    noise.tookPickupAt ? hearSound(listener, noise.tookPickupAt, "pickup") : undefined,
  ];

  return heard.filter(event => event !== undefined);
}
