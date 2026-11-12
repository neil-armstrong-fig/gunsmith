import {OfflineAudioContext} from "node-web-audio-api";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/AudioFormat";
import type {Cue} from "@gunsmith/audio-studies/types/Cue";
import type {RenderedCue} from "@gunsmith/audio-studies/types/RenderedCue";
import {scheduleVoice} from "@gunsmith/audio-studies/synthesis/ScheduleVoice";

/** Renders loops in three periods and takes the middle, retaining wraparound tails. */
export async function renderCue(cue: Cue): Promise<RenderedCue> {
  const frames = Math.round(cue.duration * AUDIO_FORMAT.sampleRate);
  const periods = periodCount(cue);
  const context = new OfflineAudioContext(cue.channels, frames * periods, AUDIO_FORMAT.sampleRate);
  for (let period = 0; period < periods; period += 1) {
    for (const voice of cue.voices) scheduleVoice(context, voice, period * cue.duration);
  }
  const buffer = await context.startRendering();
  const channels: Float32Array[] = [];
  let peak = 0;
  for (let index = 0; index < cue.channels; index += 1) {
    const channel = new Float32Array(frames);
    buffer.copyFromChannel(channel, index, loopOffset(cue, frames));
    for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
    channels.push(channel);
  }
  if (peak === 0) throw new Error(`${cue.key} rendered silence`);

  for (const channel of channels) {
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = ((channel[index] ?? 0) * cue.peak) / peak;
    }
  }
  return {key: cue.key, channels, loop: cue.loop};
}

function periodCount(cue: Cue): number {
  if (cue.loop) return 3;
  return 1;
}

function loopOffset(cue: Cue, frames: number): number {
  if (cue.loop) return frames;
  return 0;
}
