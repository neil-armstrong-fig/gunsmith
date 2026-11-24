import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";

/** What a player asked for: their words, which are data and never instructions. */
export interface GenerateArenaInput {
  prompt: string;
  /** The style the player chose (`blue` draws shapes, `red` edits a built-in arena); the dependencies' format, `shapes` unless they say otherwise, when absent. */
  style?: ArenaStyle;
  /**
   * Cancels the request: no stage starts once it has aborted, the model call in flight is told to stop, and the request rejects
   * instead of answering. The route's time limit passes `AbortSignal.timeout(...)`, so the work stops as well as the waiting.
   */
  signal?: AbortSignal;
}
