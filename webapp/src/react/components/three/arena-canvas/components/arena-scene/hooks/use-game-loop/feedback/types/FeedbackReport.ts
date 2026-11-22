import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What a local step or a batch of room snapshots tells the screen about the fight. */
export interface FeedbackReport {
  events: readonly CombatEvent[] | undefined;
  round: RoundState;
  hitPlaces: readonly Point[];
}
