/** The numbers of 16-bit PCM. A sample is written scaled by `max` so +1.0 fits, and measured against `fullScale`. */
export const PCM16 = {
  max: 32767,
  fullScale: 32768,
  bytesPerSample: 2,
} as const;
