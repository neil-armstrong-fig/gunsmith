import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

/** The user-selected tight empty-magazine click, separate from the approved pack. */
export function makeEmptyClick(): Cue {
  return {
    key: "empty-tight",
    duration: 0.07,
    channels: 1,
    peak: 0.5,
    voices: [
      {kind: "noise", at: 0, duration: 0.022, seed: 1621, cutoff: 2300, filter: "highpass", gain: 0.8},
      {kind: "tone", at: 0.002, duration: 0.026, frequency: 720, endFrequency: 260, wave: "triangle", gain: 0.22},
    ],
  };
}
