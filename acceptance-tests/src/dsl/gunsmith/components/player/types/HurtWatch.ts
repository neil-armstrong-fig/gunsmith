/** How `runUntilHurt` looks for the moment the player is hurt. */
export interface HurtWatch {
  /** The most game time to run before giving up, in seconds. */
  maxSeconds: number;
  /** How much game time to run between looks, in seconds: short enough not to run past what is to be seen. */
  stepSeconds: number;
}
