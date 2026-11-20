/** How one sound is placed in the listener's ears. */
export interface PlayOptions {
  /** Where the sound sits between the two ears: -1 is wholly the left, 0 the middle and 1 wholly the right. */
  pan: number;
  /** How loud it is, 0 for silence and 1 for the file as it is. */
  gain: number;
}
