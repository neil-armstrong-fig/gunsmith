import type {Voice} from "@gunsmith/audio-studies/types/Voice";
import {noiseSamples} from "@gunsmith/audio-studies/synthesis/noise/NoiseSamples";

/** Uses Web Audio nodes for synthesis, filtering, envelopes and stereo placement. */
export function scheduleVoice(context: OfflineAudioContext, voice: Voice, offset: number): void {
  const at = voice.at + offset;
  const end = at + voice.duration;
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(voice.gain, at + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.00001, end - 0.004);
  envelope.gain.linearRampToValueAtTime(0, end);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  if (voice.highpass) filter.type = "highpass";
  filter.frequency.value = voice.cutoff ?? 12000;
  filter.Q.value = 0.6;
  filter.connect(envelope);

  const panner = context.createStereoPanner();
  panner.pan.value = voice.pan ?? 0;
  envelope.connect(panner);
  panner.connect(context.destination);

  if (voice.noise) {
    const buffer = context.createBuffer(1, Math.ceil(voice.duration * context.sampleRate), context.sampleRate);
    buffer.copyToChannel(noiseSamples(buffer.length, voice.seed ?? 8231), 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(filter);
    source.start(at);
    source.stop(end);
    return;
  }

  const oscillator = context.createOscillator();
  oscillator.type = voice.wave ?? "sine";
  oscillator.frequency.setValueAtTime(voice.frequency, at);
  if (voice.endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, at + Math.min(0.08, voice.duration / 2));
  }
  oscillator.connect(filter);
  oscillator.start(at);
  oscillator.stop(end);
}
