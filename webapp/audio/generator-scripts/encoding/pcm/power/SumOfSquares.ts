/**
 * The sum of every sample squared, added up a frame at a time and a channel at a time within it. That order is the one the
 * recorded measurements were made in, and a different order can change the last bits of the sum.
 */
export function sumOfSquares(channels: readonly Float32Array[]): number {
  const frames = channels[0]?.length ?? 0;
  let sum = 0;
  for (let frame = 0; frame < frames; frame += 1) {
    for (const samples of channels) {
      const value = samples[frame] ?? 0;
      sum += value * value;
    }
  }

  return sum;
}
