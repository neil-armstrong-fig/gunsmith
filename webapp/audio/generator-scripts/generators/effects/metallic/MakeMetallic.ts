import {STRIKE_SHAPE} from "@gunsmith/audio-studies/generators/effects/metallic/strike/StrikeShape";
import type {MetallicEffect} from "@gunsmith/audio-studies/generators/effects/metallic/types/MetallicEffect";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * Turns a metallic effect into a mono one-shot cue. Every note is struck with three voices, in this order: a triangle
 * body, an inharmonic overtone, and a short highpassed click seeded from the note's pitch, so no two strikes click alike.
 */
export function makeMetallic(effect: MetallicEffect): Cue {
  const voices: Voice[] = [];
  for (const [at, frequency, length] of effect.notes) {
    voices.push(
      {kind: "tone", at, frequency, duration: length, gain: STRIKE_SHAPE.bodyGain, wave: "triangle"},
      {
        kind: "tone",
        at,
        frequency: frequency * STRIKE_SHAPE.overtoneRatio,
        duration: length * STRIKE_SHAPE.overtoneLength,
        gain: STRIKE_SHAPE.overtoneGain,
      },
      {
        kind: "noise",
        at,
        duration: STRIKE_SHAPE.clickSeconds,
        seed: Math.round(frequency),
        cutoff: STRIKE_SHAPE.clickCutoff,
        filter: "highpass",
        gain: STRIKE_SHAPE.clickGain,
      },
    );
  }

  return {key: effect.key, duration: effect.duration, channels: 1, peak: STRIKE_SHAPE.peak, voices};
}
