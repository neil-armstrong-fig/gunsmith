import {createHash} from "node:crypto";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";
import {dbfs} from "@gunsmith/audio-studies/output/wav/measure/Dbfs";
import {encodePcm} from "@gunsmith/audio-studies/output/wav/pcm/EncodePcm";
import {loopSeamJump} from "@gunsmith/audio-studies/output/wav/seam/LoopSeamJump";
import {wavHeader} from "@gunsmith/audio-studies/output/wav/header/WavHeader";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

/** How many times a loop is repeated when its join is judged, in the measurement of three repeats. */
const MEASURED_REPEATS = 3;

/**
 * Writes `<key>.wav` as little-endian 16-bit PCM and measures the encoded samples, not the float ones, including a loop's
 * join. Everything is checked before anything is written, so a cue that is silent, too loud, ragged, or a loop that clicks
 * at its join is an error that leaves no file behind.
 */
export async function writeWav(output: string, renderedCue: RenderedCue): Promise<Measurement> {
  const {channels, key} = renderedCue;
  const frames = frameCount(renderedCue);
  const {data, peak, power} = encodePcm(channels, key);
  if (peak === 0) {
    throw new Error(`${key}: silent`);
  }
  const wav = Buffer.concat([wavHeader({frames, channelCount: channels.length}), data]);
  const measurement: Measurement = {
    seconds: frames / AUDIO_FORMAT.sampleRate,
    channels: channels.length,
    peakDbfs: dbfs(peak),
    rmsDbfs: dbfs(Math.sqrt(power / (frames * channels.length))),
    sha256: createHash("sha256").update(wav).digest("hex"),
  };
  const measured = withLoopJoin(measurement, renderedCue, data);
  await writeFile(join(output, `${key}.wav`), wav);

  return measured;
}

function frameCount(renderedCue: RenderedCue): number {
  const {channels, key} = renderedCue;
  const frames = channels[0]?.length;
  if (frames === undefined) {
    throw new Error(`${key}: no channels`);
  }
  if (!channels.every(channel => channel.length === frames)) {
    throw new Error(`${key}: channels differ in length`);
  }

  return frames;
}

function withLoopJoin(measurement: Measurement, renderedCue: RenderedCue, data: Buffer): Measurement {
  if (!renderedCue.loop) {
    return measurement;
  }
  const jump = loopSeamJump(data, measurement.channels);
  if (jump >= MASTERING.maxLoopJump) {
    throw new Error(`${renderedCue.key}: loop discontinuity ${jump}`);
  }

  return {...measurement, seamJumpDbfs: dbfs(jump), threeRepeatsSeconds: measurement.seconds * MEASURED_REPEATS};
}
