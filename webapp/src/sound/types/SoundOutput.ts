import type {PlayOptions} from "@src/sound/types/PlayOptions";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";

/** Where a sound is played: the browser's audio, or a recorder in a test. */
export interface SoundOutput {
  /** Starts the sound named `key`, unless the output is silent; with `options` it is placed between the ears and made louder or quieter. */
  play: (key: SoundKey, options?: PlayOptions) => void;
  /** Starts a continuous sound if it is available and has no voice already playing or fading out. */
  startLoop: (key: SoundKey) => void;
  /** Fades out a continuous sound if it is still playing. */
  stopLoop: (key: SoundKey) => void;
  /** Stops every sound that is still playing. */
  stopAll: () => void;
}
