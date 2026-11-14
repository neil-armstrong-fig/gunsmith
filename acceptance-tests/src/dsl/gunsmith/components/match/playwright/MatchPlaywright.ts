import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {MatchSnapshot} from "@gunsmith/shared/state-hook/types/MatchSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class MatchPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** The score as the game itself keeps it. Throws when the game is not a match. */
  async getScore(): Promise<MatchSnapshot> {
    const {match} = await this.readGameState();
    if (!match) {
      throw new Error("This game is not a match.");
    }

    return match;
  }

  /** What the score readout over the arena says; waits for it to appear first. */
  async getScoreOnScreen(): Promise<string> {
    const readout = this.page.getByTestId("match-score");
    await expect(readout).toBeVisible();

    return await readout.innerText();
  }
}
