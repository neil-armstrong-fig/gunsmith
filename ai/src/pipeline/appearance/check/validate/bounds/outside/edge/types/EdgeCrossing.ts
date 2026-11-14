/** An edge of the design space that a part crosses: which edge, where the part reaches, the limit it must come back to, and how far that is. */
export interface EdgeCrossing {
  /** `left`, `top`, `right` or `bottom`. */
  edge: string;
  /** Where the part reaches on that edge's axis, to two decimals. */
  reach: number;
  /** The coordinate the reach must not pass: 0 for left and top, the space for right and bottom. */
  limit: number;
  /** `at least` for the left and top edges, `at most` for the right and bottom: how the reach must stand against the limit. */
  bound: string;
  /** How far the reach must be pulled back to meet the limit, to two decimals. */
  pullIn: number;
}
