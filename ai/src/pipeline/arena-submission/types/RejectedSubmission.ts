/** A submission turned away before the players see it: too long, empty, not a request for an arena, or not a built-in arena we have. */
export interface RejectedSubmission {
  playerId: string;
  /** In words the player may see. Never their own prompt repeated. */
  reason: string;
}
