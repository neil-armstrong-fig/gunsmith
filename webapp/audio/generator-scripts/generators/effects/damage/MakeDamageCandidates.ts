import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

/** The selected cue peaks at half full scale, under the mastering ceiling. The final mix still needs in-game review. */
const CANDIDATE_PEAK = 0.5;

/** Fixed noise seed for the selected crunch. */
const CRUNCH_NOISE_SEED = 1612;

/** The selected incoming-damage cue, retained as a render set. Dry mono audio carries no attacker location. */
export function makeDamageCandidates(): Cue[] {
  return [crunch()];
}

/** A thinner triangle tone falling from 240 to 100 Hz under a longer burst of highpassed noise: grit, and little body. */
function crunch(): Cue {
  return {
    key: "damage-crunch",
    duration: 0.18,
    channels: 1,
    peak: CANDIDATE_PEAK,
    voices: [
      {kind: "tone", at: 0, duration: 0.12, frequency: 240, endFrequency: 100, gain: 0.45, wave: "triangle"},
      {kind: "noise", at: 0, duration: 0.11, seed: CRUNCH_NOISE_SEED, cutoff: 650, filter: "highpass", gain: 0.65},
    ],
  };
}
