import type {StartNoiseRequest} from "@gunsmith/audio-studies/synthesis/schedule/noise-source/types/StartNoiseRequest";
import {noiseSamples} from "@gunsmith/audio-studies/synthesis/noise/NoiseSamples";

/** Plays the voice's seeded noise through `destination` for its window. */
export function startNoise({context, voice, destination, window}: StartNoiseRequest): void {
  const buffer = context.createBuffer(1, Math.ceil(voice.duration * context.sampleRate), context.sampleRate);
  buffer.copyToChannel(noiseSamples(buffer.length, voice.seed), 0);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);
  source.start(window.at);
  source.stop(window.end);
}
