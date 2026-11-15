import type {Page} from "@playwright/test";
import type {RingSnapshot} from "@gunsmith/shared/state-hook/types/RingSnapshot";
import {RingPlaywright} from "@src/dsl/gunsmith/components/ring/playwright/RingPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The round's closing ring and the countdown to it, reached as `gunsmith.ring`. */
export class RingDsl {
  private readonly ring: RingPlaywright;

  constructor(page: Page) {
    this.ring = new RingPlaywright(page);
  }

  /** The ring as the game itself reports it: the seconds of the round still to play before it starts to close. */
  async get(): Promise<RingSnapshot> {
    try {
      return await this.ring.get();
    } catch (error) {
      throw new DslError("Failed to read the ring", error);
    }
  }

  /** Whether the game has a ring at all; the practice range and sparring have none. */
  async exists(): Promise<boolean> {
    try {
      return await this.ring.exists();
    } catch (error) {
      throw new DslError("Failed to see whether the game has a ring", error);
    }
  }

  /** The words the countdown over the arena shows. */
  async getCountdownOnScreen(): Promise<string> {
    try {
      return await this.ring.getCountdownOnScreen();
    } catch (error) {
      throw new DslError("Failed to read the ring's countdown on the screen", error);
    }
  }

  /** Whether the countdown is on the screen right now. */
  async isCountdownOnScreen(): Promise<boolean> {
    try {
      return await this.ring.isCountdownOnScreen();
    } catch (error) {
      throw new DslError("Failed to see whether the ring's countdown is on the screen", error);
    }
  }
}
