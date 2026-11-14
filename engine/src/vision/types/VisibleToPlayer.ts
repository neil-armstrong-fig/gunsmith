/** What the player can see right now: the same answer the server will use to decide what to send. */
export interface VisibleToPlayer {
  /** Whether the opponent is in sight; false when there is none. */
  opponent: boolean;
  /** Whether each dummy is in sight, in the order the world lists them. */
  dummies: readonly boolean[];
  /** Whether each bullet in the air is shown, in the order the world lists them: the player's own always are, the opponent's only where the player sees. */
  bullets: readonly boolean[];
}
