/** The pitch in hertz of a MIDI note number, in even temperament with concert A (note 69) at 440 Hz. */
export function noteFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}
