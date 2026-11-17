import type {SoundKey} from "@src/assets/sounds/types/SoundKey";

/** Where a sound is played: the browser's audio, or a recorder in a test. */
export interface SoundOutput {
  /** Starts the sound named `key`, unless the output is silent. */
  play: (key: SoundKey) => void;
  /** Stops every sound that is still playing. */
  stopAll: () => void;
}
