import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";

/**
 * What a step took off the player, one event for each cause that took something, the bullet first. Each event says the health
 * actually lost: the damage is capped by the health the player had, bullets get it before the ring, and the ring gets what is
 * left, so the amounts never add up to more than the player had. A cause that took nothing makes no event.
 */
export function damageTakenEvents({health, bullet, ring}: DamageToPlayer): DamageTakenEvent[] {
  const events: DamageTakenEvent[] = [];
  const bulletLoss = Math.min(health, bullet);
  if (bulletLoss > 0) {
    events.push({kind: "damageTaken", cause: "bullet", amount: bulletLoss});
  }

  const ringLoss = Math.min(health - bulletLoss, ring);
  if (ringLoss > 0) {
    events.push({kind: "damageTaken", cause: "ring", amount: ringLoss});
  }

  return events;
}
