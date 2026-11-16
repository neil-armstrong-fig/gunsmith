import type {Stance} from "@gunsmith/audio-studies/common/step-key/types/Stance";

/** The cue key of a footfall: the first variant has no number, and the others count on from 02. */
export function stepKey(stance: Stance, variant: number): string {
  if (variant === 0) {
    return `sfx-step-${stance}`;
  }

  return `sfx-step-${stance}-0${variant + 1}`;
}
