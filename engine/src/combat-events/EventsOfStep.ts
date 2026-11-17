import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {EventsRequest} from "@gunsmith/engine/combat-events/types/EventsRequest";

/**
 * What happened to the local player in one step, for the caller to show or play: an empty click when the trigger was held
 * on a ready weapon with nothing in the magazine, whatever the reserve, and the health the player lost, once for the
 * bullets and once for the ring. A bullet takes its damage first and the ring only what health is left, so the losses add
 * up to what the player really lost; and a hit landed for each of the player's bullets that reached a target they could see.
 * Absent when nothing happened. The events are the player's alone, so nothing about the
 * opponent, hidden or not, can leave through them.
 */
export function eventsOfStep({
  playerTurn,
  damageToPlayer,
  visibleHits,
}: EventsRequest): readonly CombatEvent[] | undefined {
  const events: CombatEvent[] = [];
  if (playerTurn.refusal) {
    events.push({kind: "fireRefused", reason: playerTurn.refusal});
  }

  const bulletLoss = Math.min(damageToPlayer.health, damageToPlayer.bullet);
  if (bulletLoss > 0) {
    events.push({kind: "damageTaken", cause: "bullet", amount: bulletLoss});
  }

  const ringLoss = Math.min(damageToPlayer.health - bulletLoss, damageToPlayer.ring);
  if (ringLoss > 0) {
    events.push({kind: "damageTaken", cause: "ring", amount: ringLoss});
  }

  for (const on of visibleHits) {
    events.push({kind: "hitLanded", on});
  }

  if (events.length === 0) {
    return undefined;
  }

  return events;
}
