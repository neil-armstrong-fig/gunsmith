import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What one step of the simulation reported about the player. */
export interface StepReport {
  /** The step's own events (`World.events`); absent when nothing happened. */
  events: readonly CombatEvent[] | undefined;
  /** The round after the step. */
  round: RoundState;
}
