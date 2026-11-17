import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What `DamageCrunch` is told about one step. */
export interface CrunchRequest {
  /** The step's own events (`World.events`); absent when nothing happened. */
  events: readonly CombatEvent[] | undefined;
  /** The round after the step. */
  round: RoundState;
  /** The game time the step covered. */
  seconds: number;
}
