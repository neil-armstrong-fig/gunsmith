import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RoundPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getState(): Promise<RoundSnapshot> {
    const {round} = await this.readGameState();

    return round;
  }

  /** Waits until the round stands at `state`. */
  async waitForState(state: RoundSnapshot): Promise<void> {
    await this.waitForGameState(({round}) => round === state);
  }

  /** What the banner over the arena says; waits for it to appear first. */
  async getBannerMessage(): Promise<string> {
    const banner = this.page.getByTestId("round-banner");
    await expect(banner).toBeVisible();

    return await banner.getByRole("heading").innerText();
  }

  async isBannerShown(): Promise<boolean> {
    return await this.page.getByTestId("round-banner").isVisible();
  }

  /** Waits until the banner has gone from the screen. */
  async waitForBannerToGo(): Promise<void> {
    await expect(this.page.getByTestId("round-banner")).toBeHidden();
  }

  async playAgain(): Promise<void> {
    await this.page.getByRole("button", {name: "Play again"}).click();
  }
}
