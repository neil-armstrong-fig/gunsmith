import {hatPan} from "@gunsmith/audio-studies/generators/music/bar/pan/HatPan";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * The hi-hats of one bar: a short highpassed tick on every eighth note, or only the third and seventh in a sparse section,
 * panned alternately and seeded from the bar and step.
 */
export function makeHats(position: BarPosition): Voice[] {
  const {bar, section, start, beat} = position;
  const voices: Voice[] = [];
  for (let index = 0; index < 8; index += 1) {
    if (!section.sparse || index === 2 || index === 6) {
      voices.push({
        kind: "noise",
        at: start + (index * beat) / 2,
        duration: 0.045,
        seed: 500 + bar * 8 + index,
        cutoff: 7500,
        filter: "highpass",
        gain: 0.1,
        pan: hatPan(index),
      });
    }
  }

  return voices;
}
