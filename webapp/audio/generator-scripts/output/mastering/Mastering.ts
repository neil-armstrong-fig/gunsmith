/** The limits every rendered cue is held to. They are checked when a WAV is written, so a render that breaks one fails loudly. */
export const MASTERING = {
  /** The loudest sample any cue may have, as a share of full scale: about -3 dBFS, leaving headroom for the game's own mix. */
  maxPeak: 0.708,
  /** The loudest the audition mix may be. A mix over this is turned down as a whole, so cue-to-music ratios stay intact. */
  mixPeak: 0.65,
  /** The biggest step, as a share of full scale, between the last sample of a loop and its first, so the join does not click. */
  maxLoopJump: 0.003,
} as const;
