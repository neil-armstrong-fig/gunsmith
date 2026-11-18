/** What `shakeOffset` is asked: how long ago the hit's shake began, and how hard it shakes at most. */
export interface ShakeRequest {
  /** Seconds since the shake began; infinite before the first hit. */
  age: number;
  /** The strongest the picture moves, in screen pixels. Zero is no shake. */
  pixels: number;
}
