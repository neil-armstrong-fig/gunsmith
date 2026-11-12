import assert from "node:assert/strict";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/AudioFormat";
import type {RenderedCue} from "@gunsmith/audio-studies/types/RenderedCue";
import type {MixEvent} from "@gunsmith/audio-studies/types/MixEvent";

/** Puts centred effects over music, without positional inference or runtime ducking. */
export function makeMix(match: RenderedCue, effects: ReadonlyMap<string, RenderedCue>): RenderedCue {
  const channels = match.channels.map(channel => new Float32Array(channel));
  const timeline: MixEvent[] = [
    {at: 1.2, key: "sfx-pickup"},
    {at: 4.1, key: "sfx-reload"},
    {at: 7.2, key: "sfx-ring-warning"},
    {at: 12.3, key: "sfx-hit"},
  ];
  for (let index = 0; index < 4; index += 1) {
    timeline.push({at: 2 + index * 0.42, key: "sfx-step-stand"});
    timeline.push({at: 9.5 + index * 0.65, key: "sfx-step-crouch"});
  }
  for (const event of timeline) {
    const renderedCue = effects.get(event.key);
    assert.ok(renderedCue);
    const mono = renderedCue.channels[0];
    assert.ok(mono);
    const offset = Math.round(event.at * AUDIO_FORMAT.sampleRate);
    for (const channel of channels) {
      for (const [index, sample] of mono.entries()) {
        if (offset + index >= channel.length) break;
        channel[offset + index] = (channel[offset + index] ?? 0) + sample;
      }
    }
  }
  // A constant master reduction, only if necessary; cue/music ratios stay intact.
  let peak = 0;
  for (const channel of channels) {
    for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
  }
  if (peak > 0.65) {
    for (const channel of channels) {
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = ((channel[index] ?? 0) * 0.65) / peak;
      }
    }
  }
  return {key: "audition-mix", channels};
}
