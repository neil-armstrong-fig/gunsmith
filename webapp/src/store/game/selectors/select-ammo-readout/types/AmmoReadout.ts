/** What the ammunition display shows, worked out from the weapon in hand. */
export interface AmmoReadout {
  /** Which slot the weapon is in: 1 or 2, matching the keys that switch to it. */
  slot: number;
  /** Rounds in the magazine. */
  rounds: number;
  /** Rounds in the reserve. */
  reserve: number;
  /** How many rounds the magazine holds when full. */
  magazineSize: number;
  /** Whether the weapon is being reloaded right now. */
  reloading: boolean;
  /** How long a whole reload takes, in seconds. */
  reloadSeconds: number;
}
