import type {VoiceFilter} from "@gunsmith/audio-studies/common/types/voice/VoiceFilter";

/** What every voice has: when it sounds, how loud, and how it is filtered and placed. Cosmetic sound data, never a game contract. */
export interface VoiceBase {
  /** Seconds from the start of the cue. */
  at: number;
  /** Seconds the voice sounds for. */
  duration: number;
  gain: number;
  /** The filter's cutoff in hertz; `VOICE_SHAPE.defaultCutoff` when absent. */
  cutoff?: number;
  /** Lowpass when absent. */
  filter?: VoiceFilter;
  /** From -1 (left) to 1 (right); centred when absent. */
  pan?: number;
}
