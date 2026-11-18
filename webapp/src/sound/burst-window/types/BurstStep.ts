import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What a `BurstWindow` is told about one step. */
export interface BurstStep {
  /** Whether something that wants the sound happened in the step. */
  triggered: boolean;
  /** The round after the step. */
  round: RoundState;
  /** The game time the step covered. */
  seconds: number;
}
