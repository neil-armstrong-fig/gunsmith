/** The damage that reached the local player in one step, by cause, and the health it landed on. The opponent's is not here. */
export interface DamageToPlayer {
  /** The player's health before this step's damage. */
  health: number;
  /** The damage of every bullet that landed on the player. */
  bullet: number;
  /** The damage the ring does to the player for standing outside it. */
  ring: number;
}
