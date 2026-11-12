/** Seeded xorshift noise for reproducible original percussion, with no recordings. */
export function noiseSamples(length: number, seed: number): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(length);
  let state = seed || 8231;
  for (let index = 0; index < length; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    samples[index] = (state >>> 0) / 2147483648 - 1;
  }
  return samples;
}
