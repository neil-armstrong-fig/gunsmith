import type {NoiseVoice} from "@gunsmith/audio-studies/common/types/voice/NoiseVoice";
import type {ToneVoice} from "@gunsmith/audio-studies/common/types/voice/ToneVoice";

/** One scheduled source: a pitched tone or a burst of noise. */
export type Voice = ToneVoice | NoiseVoice;
