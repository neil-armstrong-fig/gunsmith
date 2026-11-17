import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {EventsRequest} from "@gunsmith/engine/combat-events/types/EventsRequest";

/**
 * What happened to the local player in one step, for the caller to show or play: an empty click when the trigger was held
 * on a ready weapon with nothing in the magazine, whatever the reserve. Absent when nothing happened. The events are the
 * player's alone, so nothing about the opponent, hidden or not, can leave through them.
 */
export function eventsOfStep({playerTurn}: EventsRequest): readonly CombatEvent[] | undefined {
  const events: CombatEvent[] = [];
  if (playerTurn.refusal) {
    events.push({kind: "fireRefused", reason: playerTurn.refusal});
  }

  if (events.length === 0) {
    return undefined;
  }

  return events;
}
