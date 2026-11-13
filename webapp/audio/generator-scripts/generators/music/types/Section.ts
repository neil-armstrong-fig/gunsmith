/** Eight bars of an arrangement: what plays in them. A section is where the music changes, so every section differs. */
export interface Section {
  /** Percussion thins out, and the melody plays only every other note. */
  sparse: boolean;
  /** The beats of each bar, 0 to 3, on which the kick plays. */
  kickBeats: readonly number[];
  /** The sixteenth-note steps of each bar, 0 to 15, on which the bass plays. */
  bassSteps: readonly number[];
  /** The four melody notes of each bar, as MIDI note numbers. */
  melody: readonly number[];
}
