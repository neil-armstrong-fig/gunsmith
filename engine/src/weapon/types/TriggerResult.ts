import type {TriggerRefusal} from "@gunsmith/engine/weapon/types/TriggerRefusal";

/** What pulling the trigger for one step did. */
export interface TriggerResult {
  /** Whether a shot leaves the weapon this step. */
  fires: boolean;
  /** How long until the weapon can fire again. */
  cooldownSeconds: number;
  /** Why a shot that was due did not leave; absent when it fired, was not asked for, or was held up by the cool-down or a reload. */
  refusal?: TriggerRefusal | undefined;
}
