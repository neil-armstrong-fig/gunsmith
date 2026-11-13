import type {Section} from "@gunsmith/audio-studies/generators/music/types/Section";

/** One bar of a track, and everything the instruments need to know to play it. */
export interface BarPosition {
  /** Which bar this is across the whole track, counting from 0. */
  bar: number;
  /** Which section the bar is in, counting from 0, and what that section plays. */
  sectionIndex: number;
  section: Section;
  /** The bass note this bar is built on, as a MIDI note number. */
  root: number;
  /** Seconds from the start of the track to the start of the bar. */
  start: number;
  /** Seconds in one beat. */
  beat: number;
}
