import type {VoiceBase} from "@gunsmith/audio-studies/common/types/voice/VoiceBase";

/** A voice of seeded noise: percussion, grit and clicks, with no pitch. */
export interface NoiseVoice extends VoiceBase {
  kind: "noise";
  /** The noise is the same for the same seed, so a render is reproducible. */
  seed: number;
}
