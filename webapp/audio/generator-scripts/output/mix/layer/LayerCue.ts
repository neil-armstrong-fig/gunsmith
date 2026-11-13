import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";

/**
 * Adds a mono cue into every channel, in place, starting at the frame `atSeconds` falls on, so the effect is centred. It adds
 * to what is already there, and drops whatever would run past the end of the channel.
 */
export function layerCue(channels: readonly Float32Array[], mono: Float32Array, atSeconds: number): void {
  const start = Math.round(atSeconds * AUDIO_FORMAT.sampleRate);
  for (const channel of channels) {
    for (let index = 0; index < mono.length && start + index < channel.length; index += 1) {
      channel[start + index] = (channel[start + index] ?? 0) + (mono[index] ?? 0);
    }
  }
}
