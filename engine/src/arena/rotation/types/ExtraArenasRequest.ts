/** Which arenas to draw extras from, and how many. */
export interface ExtraArenasRequest {
  /** Arenas already in the day's set, never drawn again. */
  kept: readonly string[];
  count: number;
}
