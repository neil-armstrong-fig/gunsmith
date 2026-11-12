import type {Cue} from "@gunsmith/audio-studies/types/Cue";
import type {Voice} from "@gunsmith/audio-studies/types/Voice";
import type {MetalNote} from "@gunsmith/audio-studies/types/MetalNote";

/** Original metallic gestures, neutral stingers and dry single footfalls. */
export function makeEffects(): Cue[] {
  return [
    metallic("sfx-pickup", 0.38, [
      [0, 620, 0.13],
      [0.07, 930, 0.2],
      [0.14, 1240, 0.19],
    ]),
    metallic("sfx-drop", 0.34, [
      [0, 240, 0.2],
      [0.045, 163, 0.18],
    ]),
    metallic("sfx-reload", 0.82, [
      [0, 430, 0.09],
      [0.26, 190, 0.12],
      [0.57, 740, 0.14],
    ]),
    metallic("sfx-hit", 0.2, [
      [0, 820, 0.07],
      [0.012, 1230, 0.1],
    ]),
    metallic("sfx-death", 1.35, [
      [0, 196, 0.38],
      [0.14, 146.83, 0.5],
      [0.33, 73.42, 0.8],
    ]),
    metallic("sfx-ring-warning", 2.8, [
      [0, 440, 0.24],
      [0.64, 466.16, 0.24],
      [1.22, 493.88, 0.24],
      [1.74, 523.25, 0.38],
      [2.18, 587.33, 0.48],
    ]),
    metallic("sfx-ui-click", 0.065, [[0, 1450, 0.045]]),
    metallic("sfx-round-start", 1.35, [
      [0, 293.66, 0.22],
      [0.22, 349.23, 0.22],
      [0.44, 440, 0.23],
      [0.68, 587.33, 0.55],
    ]),
    metallic("sfx-round-end", 1.65, [
      [0, 440, 0.3],
      [0.27, 349.23, 0.3],
      [0.57, 293.66, 0.85],
    ]),
    step(false),
    step(true),
  ];
}

function metallic(key: string, duration: number, notes: readonly MetalNote[]): Cue {
  const voices: Voice[] = [];
  for (const [at, frequency, length] of notes) {
    voices.push({at, frequency, duration: length, gain: 0.8, wave: "triangle"});
    voices.push({at, frequency: frequency * 2.71, duration: length * 0.7, gain: 0.22});
    voices.push({
      at,
      frequency: 0,
      duration: 0.04,
      noise: true,
      seed: Math.round(frequency),
      cutoff: 4800,
      highpass: true,
      gain: 0.18,
    });
  }
  return {key, duration, channels: 1, peak: 0.52, voices};
}

function step(crouch: boolean): Cue {
  if (crouch) {
    return {key: "sfx-step-crouch", duration: 0.24, channels: 1, peak: 0.15, voices: footfall(640)};
  }
  return {key: "sfx-step-stand", duration: 0.24, channels: 1, peak: 0.46, voices: footfall(1900)};
}

function footfall(cutoff: number): Voice[] {
  return [
    {at: 0, duration: 0.19, frequency: 0, noise: true, seed: 8231, cutoff, gain: 0.6},
    {at: 0, duration: 0.17, frequency: 94, endFrequency: 70, cutoff, gain: 0.42},
  ];
}
