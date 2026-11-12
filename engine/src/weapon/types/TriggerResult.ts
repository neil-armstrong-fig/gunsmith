/** What pulling the trigger for one step did. */
export interface TriggerResult {
  /** Whether a shot leaves the weapon this step. */
  fires: boolean;
  /** How long until the weapon can fire again. */
  cooldownSeconds: number;
}
