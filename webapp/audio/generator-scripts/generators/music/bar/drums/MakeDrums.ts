import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * The kick and snare of one bar, beat by beat, each beat's kick before its snare. The kick is a falling thud on the beats the
 * section names. The snare is a burst of noise on beats two and four, every bar in a full section and only on odd bars in a
 * sparse one, seeded from its bar and beat so no two hits are the same noise.
 */
export function makeDrums(position: BarPosition): Voice[] {
  const {bar, section, start, beat} = position;
  const voices: Voice[] = [];
  for (let index = 0; index < 4; index += 1) {
    const at = start + index * beat;
    if (section.kickBeats.includes(index)) {
      voices.push({kind: "tone", at, duration: 0.3, frequency: 145, endFrequency: 49, gain: 0.65, cutoff: 900});
    }
    if ((index === 1 || index === 3) && (!section.sparse || bar % 2 === 1)) {
      voices.push({kind: "noise", at, duration: 0.16, seed: 310 + bar * 4 + index, cutoff: 2600, gain: 0.25});
    }
  }

  return voices;
}
