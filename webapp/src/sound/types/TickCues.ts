import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What one step of the simulation tells the sounds: what happened to the player in it, and what the player's trigger and the round were doing. */
export interface TickCues {
  /** The step's own events (`World.events`); absent when nothing happened. */
  events: readonly CombatEvent[] | undefined;
  /** Whether the trigger was asked for in this step. */
  firing: boolean;
  /** Whether the round was still being fought after the step. */
  round: RoundState;
  /** The game time the step covered. */
  seconds: number;
}
