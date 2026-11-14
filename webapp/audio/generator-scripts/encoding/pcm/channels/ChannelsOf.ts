/** A decoded sample is a 32-bit float. */
const BYTES_PER_SAMPLE = 4;

/**
 * Splits interleaved little-endian 32-bit floats, as the decoder prints them, into one array per channel. Anything that is not
 * a whole number of frames, or holds a sample that is not a finite number, is not audio the checks can trust.
 */
export function channelsOf(pcm: Buffer, channelCount: number): Float32Array[] {
  const frameBytes = BYTES_PER_SAMPLE * channelCount;
  if (pcm.length === 0 || pcm.length % frameBytes !== 0) {
    throw new Error("Invalid PCM length");
  }
  const frames = pcm.length / frameBytes;
  const channels = Array.from({length: channelCount}, () => new Float32Array(frames));
  for (const [channel, samples] of channels.entries()) {
    for (let frame = 0; frame < frames; frame += 1) {
      const value = pcm.readFloatLE((frame * channelCount + channel) * BYTES_PER_SAMPLE);
      if (!Number.isFinite(value)) {
        throw new Error("Invalid PCM sample");
      }
      samples[frame] = value;
    }
  }

  return channels;
}
