/** How every voice is shaped. One table, because the envelope, the filter and the sweep were tuned by ear together. */
export const VOICE_SHAPE = {
  /** Seconds to rise from silence to the voice's gain. */
  attackSeconds: 0.003,
  /** Seconds before the voice ends at which the decay stops and the last ramp to silence begins. */
  releaseSeconds: 0.004,
  /** Where the exponential decay ends. An exponential ramp cannot reach zero, so it stops here before the final ramp. */
  decayFloorGain: 0.00001,
  /** The cutoff, in hertz, of a voice that names none. */
  defaultCutoff: 12000,
  /** The filter's resonance. */
  filterQ: 0.6,
  /** The longest, in seconds, a pitch sweep takes; a short voice sweeps over half its length instead. */
  longestSweepSeconds: 0.08,
} as const;
