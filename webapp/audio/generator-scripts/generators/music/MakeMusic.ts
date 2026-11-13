import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {bassRootOf} from "@gunsmith/audio-studies/generators/music/bar/bass/root/BassRoot";
import {makeBass} from "@gunsmith/audio-studies/generators/music/bar/bass/MakeBass";
import {makeDrums} from "@gunsmith/audio-studies/generators/music/bar/drums/MakeDrums";
import {makeHats} from "@gunsmith/audio-studies/generators/music/bar/hats/MakeHats";
import {makeMelody} from "@gunsmith/audio-studies/generators/music/bar/melody/MakeMelody";
import type {Arrangement} from "@gunsmith/audio-studies/generators/music/types/Arrangement";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

const BEATS_PER_BAR = 4;
const BARS_PER_SECTION = 8;

/** The loudest sample of a music loop after mastering: well under the effects, which sit on top of it. */
const MUSIC_PEAK = 0.25;

/**
 * Composes a looping stereo track from an arrangement: every bar of every section is played by the drums, then the hats, the
 * bass and the melody, in that order, at the tempo of the audio format. A track is as long as its sections.
 */
export function makeMusic(arrangement: Arrangement): Cue {
  const beat = 60 / AUDIO_FORMAT.bpm;
  const bars = arrangement.sections.length * BARS_PER_SECTION;
  const voices: Voice[] = [];
  for (let bar = 0; bar < bars; bar += 1) {
    const sectionIndex = Math.floor(bar / BARS_PER_SECTION);
    const section = arrangement.sections[sectionIndex];
    if (section === undefined) {
      throw new Error(`${arrangement.key} has no section ${sectionIndex}`);
    }
    const position = {bar, sectionIndex, section, root: bassRootOf(bar), start: bar * BEATS_PER_BAR * beat, beat};
    voices.push(...makeDrums(position), ...makeHats(position), ...makeBass(position), ...makeMelody(position));
  }

  return {
    key: arrangement.key,
    duration: bars * BEATS_PER_BAR * beat,
    channels: 2,
    peak: MUSIC_PEAK,
    loop: true,
    voices,
  };
}
