/** What was measured in one decoded export. The levels are raw, in full scale and in decibels below it. */
export interface PcmMeasurement {
  /** How many frames were decoded, one sample per channel in each. */
  frames: number;
  /** The loudest sample, as a share of full scale. */
  peak: number;
  rmsDbfs: number;
  /** The step from the last frame back to the first, as a share of full scale. */
  loopJump: number;
}
