/** Where the flash of a hit stands: how many hits it has seen, and how long ago the flash it started began. */
export interface Flash {
  /** The feedback store's `bulletHits` as of the last frame. */
  hitsSeen: number;
  /** Seconds since the flash began; infinite before the first hit. */
  age: number;
}
