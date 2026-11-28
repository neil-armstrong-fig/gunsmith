import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/**
 * A held game stops this long after it is asked to. It must be longer than the page can take between reading the time and pausing it, or Playwright refuses to pause "in the past":
 * a machine running other work (several sessions share this one) has taken more than a second. The game runs on, as fast as it can, up to that point.
 */
const HOLD_AFTER_MILLISECONDS = 3000;

export class ClockPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Holds the game still: nothing in the page moves, however much real time passes, until `runGameFor` lets it. A shot is in the air for a fraction of a second,
   * so a spec that wants to look at one holds the game on it. Call it once the game is open.
   */
  async holdTheGame(): Promise<void> {
    await this.page.clock.install();
    const now = await this.page.evaluate(() => Date.now());
    await this.page.clock.pauseAt(now + HOLD_AFTER_MILLISECONDS);
  }

  /** Lets a held game run for `seconds` of its own time, as fast as the machine can, and holds it again. */
  async runGameFor(seconds: number): Promise<void> {
    await this.page.clock.runFor(Math.round(seconds * 1000));
  }

  /** Waits until the game's own clock has run `seconds` further, however long that takes on the wall clock. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    const {elapsedSeconds} = await this.readGameState();

    await this.waitForGameState(state => state.elapsedSeconds >= elapsedSeconds + seconds);
  }
}
