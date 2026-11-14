import type {Page} from "@playwright/test";
import type {VisionSnapshot} from "@gunsmith/shared/state-hook/types/VisionSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class VisionPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getView(): Promise<VisionSnapshot> {
    const {vision} = await this.readGameState();

    return vision;
  }

  /** Throws when the game has no opponent. */
  async isOpponentSeen(): Promise<boolean> {
    const {opponent} = await this.readGameState();
    if (!opponent) {
      throw new Error("The game has no opponent in it.");
    }

    return opponent.visible;
  }
}
