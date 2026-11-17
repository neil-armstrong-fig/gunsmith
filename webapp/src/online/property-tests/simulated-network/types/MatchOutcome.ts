import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a simulated match came to, step by step, from the point the browser had its first snapshot. */
export interface MatchOutcome {
  /** Where the browser drew the player after each step. */
  shown: readonly Point[];
  /** Where a game with no network at all, playing the same inputs, would have the player after each step. */
  ideal: readonly Point[];
  /** Where the server had the player when the match ended. */
  serverFinal: Point;
  /** How many input frames the browser sent. */
  framesSent: number;
}
