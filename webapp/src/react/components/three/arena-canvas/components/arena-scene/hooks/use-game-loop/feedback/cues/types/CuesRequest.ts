import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";
import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";

/** What `cuesAfterTick` is told about one step: what it reported, the places a hit landed on a target the player saw, and the cues as the step before left them. */
export interface CuesRequest {
  previous: FeedbackCues;
  /** The step's own events (`World.events`); absent when nothing happened. */
  events: readonly CombatEvent[] | undefined;
  /** The round after the step. */
  round: RoundState;
  /** Where each target the player's bullets hit stands, as far as the player saw it (`hitPlacesOfStep`). */
  hitPlaces: readonly Point[];
}
