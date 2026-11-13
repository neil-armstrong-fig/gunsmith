import {PCM16} from "@gunsmith/audio-studies/output/wav/pcm/format/Pcm16";

/**
 * How far the encoded loop jumps where it wraps: the largest step, over every channel, from the last frame back to the first,
 * as a share of full scale. A big one is a click at the join.
 */
export function loopSeamJump(data: Buffer, channelCount: number): number {
  const blockAlign = channelCount * PCM16.bytesPerSample;
  let jump = 0;
  for (let channel = 0; channel < channelCount; channel += 1) {
    const first = data.readInt16LE(channel * PCM16.bytesPerSample);
    const last = data.readInt16LE(data.length - blockAlign + channel * PCM16.bytesPerSample);
    jump = Math.max(jump, Math.abs(first - last) / PCM16.fullScale);
  }

  return jump;
}
