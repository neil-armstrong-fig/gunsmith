/** What a metallic strike is made of: a triangle body, a bright inharmonic overtone, and a short click. */
export const STRIKE_SHAPE = {
  /** The cue's loudest sample after mastering. */
  peak: 0.52,
  bodyGain: 0.8,
  /** The overtone's pitch as a multiple of the body's: not a whole number, which is what makes it sound like metal. */
  overtoneRatio: 2.71,
  overtoneGain: 0.22,
  /** The overtone lasts this share of the body's length. */
  overtoneLength: 0.7,
  clickSeconds: 0.04,
  clickCutoff: 4800,
  clickGain: 0.18,
} as const;
