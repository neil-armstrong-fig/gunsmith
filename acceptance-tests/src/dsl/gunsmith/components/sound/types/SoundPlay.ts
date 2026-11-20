/** One sound the game started, as the in-page recorder saw it. */
export interface SoundPlay {
  /** The address of the file the sound was loaded from, which names its key. */
  url: string;
  /** Whether the browser's audio was `running` when the sound started: a `suspended` context starts sounds nobody hears. */
  contextState: string;
  looping: boolean;
  ended: boolean;
  /** The stereo pan when the source is connected through a panner. */
  pan?: number;
}
