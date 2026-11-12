/** What `pullTrigger` is asked to decide for one step. */
export interface TriggerRequest {
  /** How long until the weapon can fire again; zero when it is ready. */
  cooldownSeconds: number;
  /** Whether the trigger is held down. */
  firing: boolean;
  /** How much game time this step covers. */
  seconds: number;
  /** The equipped weapon's time between shots. */
  fireIntervalSeconds: number;
  /** Rounds in the equipped weapon's magazine. */
  rounds: number;
  /** Whether the equipped weapon is being reloaded, which keeps it from firing. */
  reloading: boolean;
}
