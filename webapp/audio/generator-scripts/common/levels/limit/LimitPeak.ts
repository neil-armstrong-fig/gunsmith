import {normalizeInPlace} from "@gunsmith/audio-studies/common/levels/normalize/NormalizeInPlace";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";

/**
 * Turns every channel down, in place and by the same amount, when its loudest sample is over `ceiling`. Under the
 * ceiling, and in silence, it changes nothing, so the balance between the sounds in a mix is never touched.
 */
export function limitPeak(channels: readonly Float32Array[], ceiling: number): void {
  const peak = peakOf(channels);
  if (peak > ceiling) {
    normalizeInPlace(channels, {peak, target: ceiling});
  }
}
