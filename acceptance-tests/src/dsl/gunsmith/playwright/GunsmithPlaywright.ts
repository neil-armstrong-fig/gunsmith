import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class GunsmithPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }

  /** Opens the duel with the opponent's every choice drawn from `seed`, so the same seed plays the same match. */
  async openDuel(seed: number): Promise<void> {
    await this.openScenario(`duel&seed=${seed}`);
  }

  async openSparring(): Promise<void> {
    await this.openScenario("sparring");
  }

  async resizeWindowTo(size: Size): Promise<void> {
    await this.page.setViewportSize(size);
  }

  getWindowSize(): Size {
    const size = this.page.viewportSize();
    if (!size) {
      throw new Error("The browser has no viewport to measure.");
    }

    return size;
  }

  /** Waits until the game's own clock has run `seconds` further, however long that takes on the wall clock. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    const {elapsedSeconds} = await this.readGameState();

    await this.waitForGameState(state => state.elapsedSeconds >= elapsedSeconds + seconds);
  }

  private async openScenario(scenario: string): Promise<void> {
    await this.page.goto(`/?scenario=${scenario}`);
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }
}
