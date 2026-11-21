import type {Page} from "@playwright/test";
import type {RecordNames} from "@src/dsl/gunsmith/components/sound/types/RecordNames";
import type {SoundPlay} from "@src/dsl/gunsmith/components/sound/types/SoundPlay";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** Where the in-page recorder keeps what it knows, on `window`, so each small script can reach it. */
const RECORD_NAMES: RecordNames = {
  plays: "gunsmithSpecSoundPlays",
  urlOfBytes: "gunsmithSpecSoundUrlOfBytes",
  urlOfBuffer: "gunsmithSpecSoundUrlOfBuffer",
};

export class SoundPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Starts noting every sound the game starts, from the moment the page loads. A sound lasts a fraction of a second and
   * nothing in the state hook says it played, so the recorder wraps the browser's own calls: `fetch` and
   * `decodeAudioData` tell it which file each decoded buffer came from, and `AudioBufferSourceNode.start` notes each
   * start with the state of the audio context, so a game that starts sounds in a suspended context cannot pass.
   */
  async startWatching(): Promise<void> {
    await this.makeRecords();
    await this.tagFetchedBytes();
    await this.tagDecodedBuffers();
    await this.noteStarts();
  }

  /** Every start of the sound whose file is named `key`, in order. */
  async getPlays(key: string): Promise<readonly SoundPlay[]> {
    const plays = await this.page.evaluate(
      (playsName: string): unknown => Reflect.get(window, playsName),
      RECORD_NAMES.plays,
    );
    if (!Array.isArray(plays)) {
      throw new Error("The sound recorder is not installed: the page was opened without it.");
    }

    return (plays as readonly SoundPlay[]).filter(play => play.url.includes(key));
  }

  async toggleMute(): Promise<void> {
    await this.page.keyboard.press("KeyM");
  }

  /** The page's three records: the plays, and which file each fetched byte array and each decoded buffer came from. */
  private async makeRecords(): Promise<void> {
    await this.page.addInitScript((names: RecordNames) => {
      Reflect.set(window, names.plays, []);
      Reflect.set(window, names.urlOfBytes, new WeakMap<ArrayBuffer, string>());
      Reflect.set(window, names.urlOfBuffer, new WeakMap<AudioBuffer, string>());
    }, RECORD_NAMES);
  }

  /** Every response's `arrayBuffer` remembers the address it was fetched from. */
  private async tagFetchedBytes(): Promise<void> {
    await this.page.addInitScript((names: RecordNames) => {
      const urlOfBytes = Reflect.get(window, names.urlOfBytes) as WeakMap<ArrayBuffer, string>;
      const originalFetch = window.fetch.bind(window);

      window.fetch = async (...request: Parameters<typeof fetch>): Promise<Response> => {
        const response = await originalFetch(...request);
        const originalArrayBuffer = response.arrayBuffer.bind(response);
        response.arrayBuffer = async (): Promise<ArrayBuffer> => {
          const bytes = await originalArrayBuffer();
          urlOfBytes.set(bytes, response.url);

          return bytes;
        };

        return response;
      };
    }, RECORD_NAMES);
  }

  /** Every buffer `decodeAudioData` makes remembers the address of the bytes it was decoded from. */
  private async tagDecodedBuffers(): Promise<void> {
    await this.page.addInitScript((names: RecordNames) => {
      const urlOfBytes = Reflect.get(window, names.urlOfBytes) as WeakMap<ArrayBuffer, string>;
      const urlOfBuffer = Reflect.get(window, names.urlOfBuffer) as WeakMap<AudioBuffer, string>;
      const originalDecode = BaseAudioContext.prototype.decodeAudioData;

      Reflect.set(
        BaseAudioContext.prototype,
        "decodeAudioData",
        async function (this: BaseAudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> {
          const url = urlOfBytes.get(bytes);
          const buffer = await originalDecode.call(this, bytes);
          if (url) {
            urlOfBuffer.set(buffer, url);
          }

          return buffer;
        },
      );
    }, RECORD_NAMES);
  }

  /** Notes each sound start and the stereo pan on the source's path to the output. */
  private async noteStarts(): Promise<void> {
    await this.page.addInitScript((names: RecordNames) => {
      const plays = Reflect.get(window, names.plays) as SoundPlay[];
      const urlOfBuffer = Reflect.get(window, names.urlOfBuffer) as WeakMap<AudioBuffer, string>;
      const destinations = new WeakMap<AudioNode, AudioNode>();
      const originalConnect = AudioNode.prototype.connect;
      const originalStart = AudioBufferSourceNode.prototype.start;

      Reflect.set(AudioNode.prototype, "connect", function (this: AudioNode, ...args: unknown[]): unknown {
        const destination: unknown = Reflect.apply(originalConnect, this, args);
        if (destination instanceof AudioNode) destinations.set(this, destination);

        return destination;
      });

      Reflect.set(
        AudioBufferSourceNode.prototype,
        "start",
        function (this: AudioBufferSourceNode, ...args: Parameters<AudioBufferSourceNode["start"]>): void {
          const url = this.buffer && urlOfBuffer.get(this.buffer);
          const play: SoundPlay = {
            url: url ?? "",
            contextState: this.context.state,
            looping: this.loop,
            ended: false,
          };

          // A spatial voice goes through a gain and then a stereo panner.
          const gain = destinations.get(this);
          const panner = gain && destinations.get(gain);
          if (panner instanceof StereoPannerNode && destinations.get(panner) === this.context.destination) {
            play.pan = panner.pan.value;
          }

          this.addEventListener(
            "ended",
            () => {
              play.ended = true;
            },
            {once: true},
          );

          originalStart.apply(this, args);
          plays.push(play);
        },
      );
    }, RECORD_NAMES);
  }
}
