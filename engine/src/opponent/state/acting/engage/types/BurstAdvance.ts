import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/** Whether the trigger is down this step, and the brain with its burst clock moved on. */
export interface BurstAdvance {
  firing: boolean;
  brain: OpponentBrain;
}
