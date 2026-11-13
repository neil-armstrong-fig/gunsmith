import {OfflineAudioContext} from "node-web-audio-api";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {normalizeInPlace} from "@gunsmith/audio-studies/common/levels/normalize/NormalizeInPlace";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";
import {scheduleVoice} from "@gunsmith/audio-studies/synthesis/schedule/ScheduleVoice";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

/** How many times a loop is rendered: before, during and after, so the middle copy has the wraparound tails of both. */
const LOOP_PERIODS = 3;

/**
 * Renders a cue offline and scales it so its loudest sample is the cue's peak. A loop is rendered in three periods and the
 * middle one kept, so a note that rings past the end wraps onto the start. A cue that renders as silence is an error.
 */
export async function renderCue(cue: Cue): Promise<RenderedCue> {
  const frames = Math.round(cue.duration * AUDIO_FORMAT.sampleRate);
  const periods = periodCount(cue);
  const context = new OfflineAudioContext(cue.channels, frames * periods, AUDIO_FORMAT.sampleRate);
  for (let period = 0; period < periods; period += 1) {
    for (const voice of cue.voices) {
      scheduleVoice(context, voice, period * cue.duration);
    }
  }
  const buffer = await context.startRendering();
  const channels = Array.from({length: cue.channels}, (_, index) => {
    const channel = new Float32Array(frames);
    buffer.copyFromChannel(channel, index, loopOffset(cue, frames));

    return channel;
  });
  const peak = peakOf(channels);
  if (peak === 0) {
    throw new Error(`${cue.key} rendered silence`);
  }
  normalizeInPlace(channels, {peak, target: cue.peak});

  return {key: cue.key, channels, loop: cue.loop};
}

function periodCount(cue: Cue): number {
  if (cue.loop) {
    return LOOP_PERIODS;
  }

  return 1;
}

function loopOffset(cue: Cue, frames: number): number {
  if (cue.loop) {
    return frames;
  }

  return 0;
}
