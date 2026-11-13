import type {MetallicEffect} from "@gunsmith/audio-studies/generators/effects/metallic/types/MetallicEffect";

/**
 * The effects made of metallic strikes, in the order they are rendered (which is the order of the pack's measurements). Each
 * note is a start time, a pitch in hertz and a length in seconds; the pitches are even-tempered notes, in D minor where they
 * rise and fall as a phrase.
 */
export const METALLIC_EFFECTS: readonly MetallicEffect[] = [
  {
    key: "sfx-pickup",
    duration: 0.38,
    notes: [
      [0, 620, 0.13],
      [0.07, 930, 0.2],
      [0.14, 1240, 0.19],
    ],
  },
  {
    key: "sfx-drop",
    duration: 0.34,
    notes: [
      [0, 240, 0.2],
      [0.045, 163, 0.18],
    ],
  },
  {
    key: "sfx-reload",
    duration: 0.82,
    notes: [
      [0, 430, 0.09],
      [0.26, 190, 0.12],
      [0.57, 740, 0.14],
    ],
  },
  {
    key: "sfx-hit",
    duration: 0.2,
    notes: [
      [0, 820, 0.07],
      [0.012, 1230, 0.1],
    ],
  },
  {
    key: "sfx-death",
    duration: 1.35,
    notes: [
      [0, 196, 0.38],
      [0.14, 146.83, 0.5],
      [0.33, 73.42, 0.8],
    ],
  },
  {
    key: "sfx-ring-warning",
    duration: 2.8,
    notes: [
      [0, 440, 0.24],
      [0.64, 466.16, 0.24],
      [1.22, 493.88, 0.24],
      [1.74, 523.25, 0.38],
      [2.18, 587.33, 0.48],
    ],
  },
  {key: "sfx-ui-click", duration: 0.065, notes: [[0, 1450, 0.045]]},
  {
    key: "sfx-round-start",
    duration: 1.35,
    notes: [
      [0, 293.66, 0.22],
      [0.22, 349.23, 0.22],
      [0.44, 440, 0.23],
      [0.68, 587.33, 0.55],
    ],
  },
  {
    key: "sfx-round-end",
    duration: 1.65,
    notes: [
      [0, 440, 0.3],
      [0.27, 349.23, 0.3],
      [0.57, 293.66, 0.85],
    ],
  },
];
