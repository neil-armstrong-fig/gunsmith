import type {Section} from "@gunsmith/audio-studies/generators/music/types/Section";

/** A whole track: its cue key and its sections in order. The track is as long as its sections. */
export interface Arrangement {
  key: string;
  sections: readonly Section[];
}
