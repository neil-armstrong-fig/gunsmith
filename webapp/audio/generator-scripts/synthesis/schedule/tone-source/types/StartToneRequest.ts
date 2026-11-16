import type {VoiceWindow} from "@gunsmith/audio-studies/synthesis/schedule/types/VoiceWindow";
import type {ToneVoice} from "@gunsmith/audio-studies/common/types/voice/ToneVoice";

export interface StartToneRequest {
  context: OfflineAudioContext;
  voice: ToneVoice;
  destination: AudioNode;
  window: VoiceWindow;
}
