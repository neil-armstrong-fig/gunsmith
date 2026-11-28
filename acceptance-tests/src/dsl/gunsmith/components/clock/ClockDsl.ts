import type {Page} from "@playwright/test";
import {ClockPlaywright} from "@src/dsl/gunsmith/components/clock/playwright/ClockPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The game's own clock, reached as `gunsmith.clock`: hold it still, let it run, or wait for it. */
export class ClockDsl {
  private readonly clock: ClockPlaywright;

  constructor(page: Page) {
    this.clock = new ClockPlaywright(page);
  }

  /**
   * Holds the game still until `runGameFor` lets it move, so a spec can look at what is in the air for a fraction of a second. Open the game first. While it is held,
   * nothing that waits on the game (a wait for a bullet, for health) can finish: let it run first.
   */
  async holdTheGame(): Promise<void> {
    try {
      await this.clock.holdTheGame();
    } catch (error) {
      throw new DslError("Failed to hold the game still", error);
    }
  }

  /** Lets the held game run for `seconds` of its own time, then holds it again. */
  async runGameFor(seconds: number): Promise<void> {
    try {
      await this.clock.runGameFor(seconds);
    } catch (error) {
      throw new DslError(`Failed to run the held game for ${seconds} seconds`, error);
    }
  }

  /** Waits until the game's own clock has run `seconds` further. Never sleeps: the game may run fast or slow. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    try {
      await this.clock.waitForGameSeconds(seconds);
    } catch (error) {
      throw new DslError(`Failed to wait for ${seconds} seconds of game time`, error);
    }
  }
}
