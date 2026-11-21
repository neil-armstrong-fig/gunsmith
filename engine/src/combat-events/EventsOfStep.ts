import {damageTakenEvents} from "@gunsmith/engine/combat-events/damage-taken/DamageTakenEvents";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {EventsRequest} from "@gunsmith/engine/combat-events/types/EventsRequest";

/**
 * What happened to the local player in one step, for the caller to show or play: a successful shot, or an empty click when the trigger was held
 * on a ready weapon with nothing in the magazine, whatever the reserve, a reload that began, then the health they lost to a bullet and to the ring
 * (`damageTakenEvents`), then a hit landed for each of the player's bullets that reached a target they could see,
 * and a pickup taken if the player collected it, and last what the player heard of the other fighter (`heardInStep`). Absent
 * when nothing happened. The events are the player's alone, so nothing about the opponent, hidden or not, can leave through
 * them but the direction a shot was heard from.
 */
export function eventsOfStep({
  playerTurn,
  damage,
  visibleHits,
  playerTookPickup,
  footfall,
  heard,
}: EventsRequest): readonly CombatEvent[] | undefined {
  const events: CombatEvent[] = [];
  if (playerTurn.fires) {
    events.push({kind: "shotFired"});
  }

  if (playerTurn.refusal) {
    events.push({kind: "fireRefused", reason: playerTurn.refusal});
  }

  if (playerTurn.reloadStarted) {
    events.push({kind: "reloadStarted"});
  }

  events.push(...damageTakenEvents(damage));

  for (const on of visibleHits) {
    events.push({kind: "hitLanded", on});
  }

  if (playerTookPickup) {
    events.push({kind: "pickupTaken"});
  }

  if (footfall) {
    events.push({kind: "footstep"});
  }

  events.push(...heard);

  if (events.length === 0) {
    return undefined;
  }

  return events;
}
