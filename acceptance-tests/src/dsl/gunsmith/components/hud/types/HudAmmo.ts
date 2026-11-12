/** The ammunition numbers on the screen, read back as a player would read them. */
export interface HudAmmo {
  /** The slot of the weapon shown: 1 or 2. */
  slot: number;
  /** Rounds in the magazine. */
  rounds: number;
  /** Rounds in the reserve. */
  reserve: number;
  /** Whether the screen says the weapon is being reloaded. */
  reloading: boolean;
}
