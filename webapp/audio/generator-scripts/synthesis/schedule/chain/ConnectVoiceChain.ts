import {VOICE_SHAPE} from "@gunsmith/audio-studies/synthesis/schedule/shape/VoiceShape";
import type {VoiceWindow} from "@gunsmith/audio-studies/synthesis/schedule/types/VoiceWindow";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * Builds what every voice is played through: a filter into an envelope into a stereo panner into the output. The envelope
 * rises over the attack, decays exponentially to a floor, and ramps to silence at the end, so a voice never clicks. Returns
 * the filter, which is where the source connects.
 */
export function connectVoiceChain(context: OfflineAudioContext, voice: Voice, window: VoiceWindow): BiquadFilterNode {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, window.at);
  envelope.gain.linearRampToValueAtTime(voice.gain, window.at + VOICE_SHAPE.attackSeconds);
  envelope.gain.exponentialRampToValueAtTime(VOICE_SHAPE.decayFloorGain, window.end - VOICE_SHAPE.releaseSeconds);
  envelope.gain.linearRampToValueAtTime(0, window.end);

  const filter = context.createBiquadFilter();
  filter.type = voice.filter ?? "lowpass";
  filter.frequency.value = voice.cutoff ?? VOICE_SHAPE.defaultCutoff;
  filter.Q.value = VOICE_SHAPE.filterQ;
  filter.connect(envelope);

  const panner = context.createStereoPanner();
  panner.pan.value = voice.pan ?? 0;
  envelope.connect(panner);
  panner.connect(context.destination);

  return filter;
}
