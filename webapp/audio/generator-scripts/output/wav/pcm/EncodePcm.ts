import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";
import {PCM16} from "@gunsmith/audio-studies/output/wav/pcm/format/Pcm16";
import type {EncodedPcm} from "@gunsmith/audio-studies/output/wav/pcm/types/EncodedPcm";

/**
 * Encodes planar float channels as interleaved 16-bit PCM and measures what was written, not what was meant: the peak and
 * the power come from the rounded integers. A sample over the mastering ceiling, or not a number, is an error naming the cue.
 * Power is summed frame by frame, channel by channel, in that order, so the total is the same bits every time.
 */
export function encodePcm(channels: readonly Float32Array[], key: string): EncodedPcm {
  const frames = channels[0]?.length ?? 0;
  const blockAlign = channels.length * PCM16.bytesPerSample;
  const data = Buffer.alloc(frames * blockAlign);
  let peak = 0;
  let power = 0;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let index = 0; index < channels.length; index += 1) {
      const sample = channels[index]?.[frame];
      if (sample === undefined || !Number.isFinite(sample) || Math.abs(sample) > MASTERING.maxPeak) {
        throw new Error(`${key}: headroom`);
      }
      const pcm = Math.round(sample * PCM16.max);
      data.writeInt16LE(pcm, frame * blockAlign + index * PCM16.bytesPerSample);
      peak = Math.max(peak, Math.abs(pcm) / PCM16.fullScale);
      power += (pcm / PCM16.fullScale) ** 2;
    }
  }

  return {data, peak, power};
}
