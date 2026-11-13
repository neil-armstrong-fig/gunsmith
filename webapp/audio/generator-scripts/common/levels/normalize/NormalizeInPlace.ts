import type {PeakTarget} from "@gunsmith/audio-studies/common/levels/normalize/types/PeakTarget";

/**
 * Scales every channel, in place, so a sample at the old peak lands on the target. It multiplies by the target and then
 * divides by the old peak, in that order, which is how the approved pack was rendered. A mathematically equal form (multiplying
 * by the ratio) almost always gives the same 32-bit result, but not provably always, so the order is kept.
 */
export function normalizeInPlace(channels: readonly Float32Array[], level: PeakTarget): void {
  for (const channel of channels) {
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = ((channel[index] ?? 0) * level.target) / level.peak;
    }
  }
}
