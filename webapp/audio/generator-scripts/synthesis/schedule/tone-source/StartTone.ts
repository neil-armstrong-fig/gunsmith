import type {StartToneRequest} from "@gunsmith/audio-studies/synthesis/schedule/tone-source/types/StartToneRequest";
import {VOICE_SHAPE} from "@gunsmith/audio-studies/synthesis/schedule/shape/VoiceShape";

/** Plays the voice's oscillator through `destination` for its window, sweeping its pitch first when it has an end pitch. */
export function startTone({context, voice, destination, window}: StartToneRequest): void {
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
