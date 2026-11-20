import {SOUND_KEYS} from "@src/assets/sounds/SoundKeys";
import {SOUND_URLS} from "@src/assets/sounds/SoundUrls";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";
import type {PlayOptions} from "@src/sound/types/PlayOptions";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {LoopVoice} from "@src/sound/web-audio/types/LoopVoice";
import {connectVoice} from "@src/sound/web-audio/voice/ConnectVoice";

const LOOP_FADE_SECONDS = 0.1;

/**
 * Plays the game's sounds through the browser's Web Audio. `start` makes the audio context, loads every sound and listens for
 * the first press or key, since a context made before one is suspended and a sound started in it is never heard (it would
 * also play late, when the context woke up); until it is running a sound is dropped, not queued. `stop` closes it again.
 * A repeat replaces the previous voice in the same channel. Local and spatial voices can overlap. Playback respects `isMuted`.
 */
export class WebAudioOutput implements SoundOutput {
  private context: AudioContext | undefined;
  private readonly buffers = new Map<SoundKey, AudioBuffer>();
  private readonly voices = new Map<SoundKey, AudioBufferSourceNode>();
  private readonly placedVoices = new Map<SoundKey, AudioBufferSourceNode>();
  private readonly loops = new Map<SoundKey, LoopVoice>();

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
    this.loops.clear();
    this.buffers.clear();
    void this.context?.close();
    this.context = undefined;
  }

  play(key: SoundKey, options?: PlayOptions): void {
    const {context} = this;
    const buffer = this.buffers.get(key);
    if (!context || !buffer || this.isMuted() || context.state !== "running") {
      return;
    }

    const voices = this.voicesFor(options);
    voices.get(key)?.stop();

    const voice = context.createBufferSource();
    voice.buffer = buffer;
    connectVoice(context, voice, options);
    voice.start();
    voices.set(key, voice);
  }

  startLoop(key: SoundKey): void {
    if (this.loops.has(key)) return;

    const {context} = this;
    const buffer = this.buffers.get(key);
    if (!context || !buffer || this.isMuted() || context.state !== "running" || !document.hasFocus()) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    const startedAt = context.currentTime;
    const loopVoice: LoopVoice = {source, gain, startedAt, stopping: false};
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0, startedAt);
    gain.gain.linearRampToValueAtTime(1, startedAt + LOOP_FADE_SECONDS);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (this.loops.get(key) === loopVoice) this.loops.delete(key);
    };
    source.start(startedAt);
    this.loops.set(key, loopVoice);
  }

  stopLoop(key: SoundKey): void {
    const loopVoice = this.loops.get(key);
    if (!loopVoice || loopVoice.stopping) return;

    const {source, gain, startedAt} = loopVoice;
    const now = source.context.currentTime;
    const fadeEndsAt = now + LOOP_FADE_SECONDS;
    const currentGain = Math.min(1, (now - startedAt) / LOOP_FADE_SECONDS);
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(currentGain, now);
    gain.gain.linearRampToValueAtTime(0, fadeEndsAt);
    source.stop(fadeEndsAt);
    loopVoice.stopping = true;
  }

  stopAll(): void {
    for (const voice of this.voices.values()) {
      voice.stop();
    }

    this.voices.clear();

    for (const voice of this.placedVoices.values()) {
      voice.stop();
    }

    this.placedVoices.clear();

    for (const key of this.loops.keys()) {
      this.stopLoop(key);
    }
  }

  private voicesFor(options: PlayOptions | undefined): Map<SoundKey, AudioBufferSourceNode> {
    if (options) return this.placedVoices;

    return this.voices;
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
