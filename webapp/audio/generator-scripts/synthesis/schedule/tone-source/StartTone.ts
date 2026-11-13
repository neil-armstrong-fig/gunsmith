import {VOICE_SHAPE} from "@gunsmith/audio-studies/synthesis/schedule/shape/VoiceShape";
import type {VoiceWindow} from "@gunsmith/audio-studies/synthesis/schedule/types/VoiceWindow";
import type {ToneVoice} from "@gunsmith/audio-studies/common/types/voice/ToneVoice";

/** Plays the voice's oscillator through `destination` for its window, sweeping its pitch first when it has an end pitch. */
export function startTone(
  context: OfflineAudioContext,
  voice: ToneVoice,
  destination: AudioNode,
  window: VoiceWindow,
): void {
  const oscillator = context.createOscillator();
  oscillator.type = voice.wave ?? "sine";
  oscillator.frequency.setValueAtTime(voice.frequency, window.at);
  if (voice.endFrequency !== undefined) {
    const sweepSeconds = Math.min(VOICE_SHAPE.longestSweepSeconds, voice.duration / 2);
    oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, window.at + sweepSeconds);
  }
  oscillator.connect(destination);
  oscillator.start(window.at);
  oscillator.stop(window.end);
}
