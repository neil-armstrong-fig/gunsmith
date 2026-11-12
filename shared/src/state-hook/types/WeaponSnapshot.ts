/** The weapon the player is holding, and how much ammunition is left for it. */
export interface WeaponSnapshot {
  /** Which slot the weapon is in: 1 or 2, matching the keys that switch to it. */
  slot: number;
  /** Rounds in the magazine: what the next shots spend. */
  rounds: number;
  /** Rounds in the reserve: what a reload moves into the magazine. */
  reserve: number;
  /** Whether the weapon is being reloaded right now. */
  reloading: boolean;
}
