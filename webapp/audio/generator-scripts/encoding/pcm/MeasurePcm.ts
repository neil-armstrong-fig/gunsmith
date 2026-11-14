import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";
import {channelsOf} from "@gunsmith/audio-studies/encoding/pcm/channels/ChannelsOf";
import {loopJumpOf} from "@gunsmith/audio-studies/encoding/pcm/loop/LoopJumpOf";
import {sumOfSquares} from "@gunsmith/audio-studies/encoding/pcm/power/SumOfSquares";
import type {PcmMeasurement} from "@gunsmith/audio-studies/encoding/pcm/types/PcmMeasurement";

/**
 * Measures what a decoder printed: its length, loudest sample, RMS and the jump where it would loop. These are raw floats, not
 * the rounded numbers of `measurements.json`, because a margin judged on rounded figures could flip. Silent or clipped audio
 * is rejected, as is anything `channelsOf` rejects.
 */
export function measurePcm(pcm: Buffer, channelCount: number): PcmMeasurement {
  const channels = channelsOf(pcm, channelCount);
  const peak = peakOf(channels);
  if (peak === 0 || peak >= 1) {
    throw new Error("Silent or clipped PCM");
  }
  const frames = channels[0]?.length ?? 0;

  return {
    frames,
    peak,
    rmsDbfs: 20 * Math.log10(Math.sqrt(sumOfSquares(channels) / (frames * channelCount))),
    loopJump: loopJumpOf(channels),
  };
}
