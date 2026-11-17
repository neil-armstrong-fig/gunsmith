/** What one step meant to take off the player: the health they had going in and the damage each cause was worth, before health ran out. */
export interface DamageToPlayer {
  health: number;
  /** What the bullets that reached the player in this step were worth together. */
  bullet: number;
  /** What the ring took over this step. */
  ring: number;
}
