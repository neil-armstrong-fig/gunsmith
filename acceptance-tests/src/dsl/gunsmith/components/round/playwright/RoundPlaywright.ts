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

  /** Waits until the round stands at `state`, for as long as the expect timeout or `timeoutSeconds` allows. */
  async waitForState(state: RoundSnapshot, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({round}) => round === state, timeoutSeconds);
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

  /** The score line on the banner; waits for the banner to appear first. */
  async getBannerScore(): Promise<string> {
    const score = this.page.getByTestId("round-banner-score");
    await expect(score).toBeVisible();

    return await score.innerText();
  }

  async isNextRoundOffered(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Next round"}).isVisible();
  }

  async isPlayAgainOffered(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Play again"}).isVisible();
  }

  async nextRound(): Promise<void> {
    await this.page.getByRole("button", {name: "Next round"}).click();
  }

  async playAgain(): Promise<void> {
    await this.page.getByRole("button", {name: "Play again"}).click();
  }
}
