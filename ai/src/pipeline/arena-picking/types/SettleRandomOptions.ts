/** What settling a random choice needs: the one arena that was picked, if any, the two arenas submitted, and the seed to draw from. */
export interface SettleRandomOptions {
  /** The `playerId` of the one arena that was picked, if any player picked one. */
  pick: string | undefined;
  submitted: readonly [string, string];
  seed: number;
}
