import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** What `ClickLatch` is told about one step. */
export interface ClickRequest {
  /** Whether the weapon refused a held trigger as empty in this step. */
  refused: boolean;
  /** Whether the trigger was asked for in this step. */
  firing: boolean;
  /** The round after the step. */
  round: RoundState;
}
