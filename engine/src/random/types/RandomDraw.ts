/** One draw from the seeded generator: the number, and the seed to carry into the next draw. */
export interface RandomDraw {
  /** A number from zero up to, but not including, one. */
  value: number;
  /** The seed for the next draw. A whole number, so it is plain data a world can hold and a match can be replayed from. */
  seed: number;
}
