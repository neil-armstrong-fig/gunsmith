import type {Page} from "@playwright/test";
import {SoundPlaywright} from "@src/dsl/gunsmith/components/sound/playwright/SoundPlaywright";
import type {SoundPlay} from "@src/dsl/gunsmith/components/sound/types/SoundPlay";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** What the game has played, reached as `gunsmith.sound`. A sound is named by its manifest key, such as `sfx-empty-click`. */
export class SoundDsl {
  private readonly sound: SoundPlaywright;

  constructor(page: Page) {
    this.sound = new SoundPlaywright(page);
  }

  /** Begins noting every sound the game starts from page load, so a short one cannot be missed. */
  async startWatching(): Promise<void> {
    try {
      await this.sound.startWatching();
    } catch (error) {
      throw new DslError("Failed to start watching for sounds", error);
    }
  }

  /** Every time the sound named `key` has started, in order, with whether the audio was running when it did. */
  async getPlays(key: string): Promise<readonly SoundPlay[]> {
    try {
      return await this.sound.getPlays(key);
    } catch (error) {
      throw new DslError(`Failed to read the plays of ${key}`, error);
    }
  }

  /** Presses the mute key: the first press silences the game and the next brings the sound back. */
  async toggleMute(): Promise<void> {
    try {
      await this.sound.toggleMute();
    } catch (error) {
      throw new DslError("Failed to press the mute key", error);
    }
  }
}
