import {hatPan} from "@gunsmith/audio-studies/generators/music/bar/pan/HatPan";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

/**
 * The melody of one bar: each note a triangle wave on the off-beat, with a much quieter echo three-eighths of a beat after it
 * on the other side of the stereo field. A sparse section plays only its first and third notes. The filter closes a little
 * more in each section, so the plucks soften as the bass brightens.
 */
export function makeMelody(position: BarPosition): Voice[] {
  const {section, sectionIndex, start, beat} = position;
  const voices: Voice[] = [];
  for (const [index, note] of section.melody.entries()) {
    if (section.sparse && index % 2 === 1) {
      continue;
    }
    const at = start + (index + 0.5) * beat;
    const pluck: Voice = {
      kind: "tone",
      at,
      duration: 0.62,
      frequency: noteFrequency(note),
      wave: "triangle",
      cutoff: 2200 - sectionIndex * 100,
      gain: 0.14,
      pan: hatPan(index),
    };
    voices.push(pluck, {...pluck, at: at + 0.75 * beat, gain: 0.04, pan: -hatPan(index)});
  }

  return voices;
}
