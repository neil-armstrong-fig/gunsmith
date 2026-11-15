import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {RingSnapshot} from "@gunsmith/shared/state-hook/types/RingSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RingPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** The ring as the game itself reports it. Throws when the game has no ring. */
  async get(): Promise<RingSnapshot> {
    const {ring} = await this.readGameState();
    if (!ring) {
      throw new Error("This game has no ring.");
    }

    return ring;
  }

  async exists(): Promise<boolean> {
    const {ring} = await this.readGameState();

    return ring !== undefined;
  }

  /** What the countdown over the arena says; waits for it to appear first. */
  async getCountdownOnScreen(): Promise<string> {
    const countdown = this.page.getByTestId("ring-countdown");
    await expect(countdown).toBeVisible();

    return await countdown.innerText();
  }

  async isCountdownOnScreen(): Promise<boolean> {
    return await this.page.getByTestId("ring-countdown").isVisible();
  }
}
