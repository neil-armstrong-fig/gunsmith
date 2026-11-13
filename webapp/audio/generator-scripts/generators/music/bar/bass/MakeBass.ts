import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * The bass of one bar: a sawtooth on the bar's root note at each sixteenth-note step the section names. Stabs in a full
 * section, long notes in a sparse one. The filter opens a little more in each section, so the music brightens as it goes.
 */
export function makeBass(position: BarPosition): Voice[] {
  const {section, sectionIndex, root, start, beat} = position;
  const duration = bassDuration(section.sparse, beat);

  return section.bassSteps.map(step => ({
    kind: "tone",
    at: start + (step * beat) / 4,
    duration,
    frequency: noteFrequency(root),
    wave: "sawtooth",
    cutoff: 680 + sectionIndex * 60,
    gain: 0.28,
  }));
}

function bassDuration(sparse: boolean, beat: number): number {
  if (sparse) {
    return beat * 0.9;
  }

  return beat * 0.43;
}
