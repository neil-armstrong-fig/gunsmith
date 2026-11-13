import type {Stance} from "@gunsmith/audio-studies/common/step-key/types/Stance";
import {STANCE_SHAPE} from "@gunsmith/audio-studies/generators/effects/steps/stance/StanceShape";
import {stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

/** How long every footfall lasts, in seconds. */
const STEP_SECONDS = 0.24;

/**
 * One dry footfall for a stance: a thud of filtered noise with a low pitch drop under it, mono, with no room. Each variant
 * moves the noise seed, the thud's length and the drop's start and pitches a little, so a run of steps does not repeat.
 */
export function makeStep(stance: Stance, variant: number): Cue {
  const {cutoff, peak} = STANCE_SHAPE[stance];

  return {
    key: stepKey(stance, variant),
    duration: STEP_SECONDS,
    channels: 1,
    peak,
    voices: [
      {kind: "noise", at: 0, duration: 0.19 - variant * 0.008, seed: NOISE_SEED + variant, cutoff, gain: 0.6},
      {
        kind: "tone",
        at: variant * 0.002,
        duration: 0.17,
        frequency: 94 + variant * 3,
        endFrequency: 70 + variant * 2,
        cutoff,
        gain: 0.42,
      },
    ],
  };
}
