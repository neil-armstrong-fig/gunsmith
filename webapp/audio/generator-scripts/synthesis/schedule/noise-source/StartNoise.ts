import {noiseSamples} from "@gunsmith/audio-studies/synthesis/noise/NoiseSamples";
import type {VoiceWindow} from "@gunsmith/audio-studies/synthesis/schedule/types/VoiceWindow";
import type {NoiseVoice} from "@gunsmith/audio-studies/common/types/voice/NoiseVoice";

/** Plays the voice's seeded noise through `destination` for its window. */
export function startNoise(
  context: OfflineAudioContext,
  voice: NoiseVoice,
  destination: AudioNode,
  window: VoiceWindow,
): void {
  const buffer = context.createBuffer(1, Math.ceil(voice.duration * context.sampleRate), context.sampleRate);
  buffer.copyToChannel(noiseSamples(buffer.length, voice.seed), 0);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);
  source.start(window.at);
  source.stop(window.end);
}
