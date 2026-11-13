import type {MetalNote} from "@gunsmith/audio-studies/generators/effects/metallic/types/MetalNote";

/** A cue made of metallic strikes: its key, how long it lasts, and the strikes in it. */
export interface MetallicEffect {
  key: string;
  duration: number;
  notes: readonly MetalNote[];
}
