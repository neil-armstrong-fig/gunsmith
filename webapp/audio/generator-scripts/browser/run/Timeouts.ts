/** How long the browser gets, in milliseconds. */
export const TIMEOUTS = {
  /** To decode and check every export: a whole pack, so it takes a while. */
  packMs: 180_000,
  /** To check one faulty file, which is a fraction of a second of audio. */
  controlMs: 5_000,
} as const;
