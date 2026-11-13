/** The loudest sample across every channel, whichever its sign. Silence, and no channels at all, give zero. */
export function peakOf(channels: readonly Float32Array[]): number {
  let peak = 0;
  for (const channel of channels) {
    for (const sample of channel) {
      peak = Math.max(peak, Math.abs(sample));
    }
  }

  return peak;
}
