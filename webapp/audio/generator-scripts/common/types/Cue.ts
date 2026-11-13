import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/** A static audition, with an explicit format and mastering target. */
export interface Cue {
  key: string;
  duration: number;
  channels: number;
  peak: number;
  loop?: boolean;
  voices: readonly Voice[];
}
