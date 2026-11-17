import {SOUND_KEYS} from "@src/assets/sounds/SoundKeys";
import {SOUND_URLS} from "@src/assets/sounds/SoundUrls";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";
import type {SoundOutput} from "@src/sound/types/SoundOutput";

/**
 * Plays the game's sounds through the browser's Web Audio. `start` makes the audio context, loads every sound and listens for
 * the first press or key, since a context made before one is suspended and a sound started in it is never heard (it would
 * also play late, when the context woke up); until it is running a sound is dropped, not queued. `stop` closes it again.
 * A sound that is still playing when the same one starts again is replaced, so one voice per sound. It plays nothing while
 * `isMuted` says so.
 */
export class WebAudioOutput implements SoundOutput {
  private context: AudioContext | undefined;
  private readonly buffers = new Map<SoundKey, AudioBuffer>();
  private readonly voices = new Map<SoundKey, AudioBufferSourceNode>();

  constructor(private readonly isMuted: () => boolean) {}

  start(): void {
    const context = new AudioContext();
    this.context = context;
    window.addEventListener("pointerdown", this.wake);
    window.addEventListener("keydown", this.wake);

    for (const key of SOUND_KEYS) {
      void this.load(context, key);
    }
  }

  stop(): void {
    window.removeEventListener("pointerdown", this.wake);
    window.removeEventListener("keydown", this.wake);
    this.stopAll();
    this.buffers.clear();
    void this.context?.close();
    this.context = undefined;
  }

  play(key: SoundKey): void {
    const {context} = this;
    const buffer = this.buffers.get(key);
    if (!context || !buffer || this.isMuted() || context.state !== "running") {
      return;
    }

    this.voices.get(key)?.stop();

    const voice = context.createBufferSource();
    voice.buffer = buffer;
    voice.connect(context.destination);
    voice.start();
    this.voices.set(key, voice);
  }

  stopAll(): void {
    for (const voice of this.voices.values()) {
      voice.stop();
    }

    this.voices.clear();
  }

  private readonly wake = (): void => {
    void this.context?.resume();
  };

  private async load(context: AudioContext, key: SoundKey): Promise<void> {
    const response = await fetch(SOUND_URLS[key]);
    const bytes = await response.arrayBuffer();
    const buffer = await context.decodeAudioData(bytes);

    if (this.context === context) {
      this.buffers.set(key, buffer);
    }
  }
}
