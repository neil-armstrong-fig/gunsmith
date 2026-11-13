import type {VoiceBase} from "@gunsmith/audio-studies/common/types/voice/VoiceBase";

/** A pitched voice: an oscillator, optionally sweeping to a lower or higher pitch at its start. */
export interface ToneVoice extends VoiceBase {
  kind: "tone";
  frequency: number;
  /** The pitch the voice sweeps to over its first moments; it holds `frequency` when absent. */
  endFrequency?: number;
  /** A sine when absent. */
  wave?: OscillatorType;
}
