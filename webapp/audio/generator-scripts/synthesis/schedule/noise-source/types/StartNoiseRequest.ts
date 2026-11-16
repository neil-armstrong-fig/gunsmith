import type {VoiceWindow} from "@gunsmith/audio-studies/synthesis/schedule/types/VoiceWindow";
import type {NoiseVoice} from "@gunsmith/audio-studies/common/types/voice/NoiseVoice";

export interface StartNoiseRequest {
  context: OfflineAudioContext;
  voice: NoiseVoice;
  destination: AudioNode;
  window: VoiceWindow;
}
