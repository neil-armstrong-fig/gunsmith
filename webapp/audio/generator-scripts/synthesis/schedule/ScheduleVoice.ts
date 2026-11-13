import {connectVoiceChain} from "@gunsmith/audio-studies/synthesis/schedule/chain/ConnectVoiceChain";
import {startNoise} from "@gunsmith/audio-studies/synthesis/schedule/noise-source/StartNoise";
import {startTone} from "@gunsmith/audio-studies/synthesis/schedule/tone-source/StartTone";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * Schedules one voice on the context with Web Audio nodes (synthesis, filtering, envelope and stereo placement), `offset`
 * seconds later than its own time, which is how a looped cue places each repeat.
 */
export function scheduleVoice(context: OfflineAudioContext, voice: Voice, offset: number): void {
  const window = {at: voice.at + offset, end: voice.at + offset + voice.duration};
  const filter = connectVoiceChain(context, voice, window);
  if (voice.kind === "noise") {
    startNoise(context, voice, filter, window);
    return;
  }

  startTone(context, voice, filter, window);
}
