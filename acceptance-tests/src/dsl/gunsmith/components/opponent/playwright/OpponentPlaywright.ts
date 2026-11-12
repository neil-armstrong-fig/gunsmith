import type {Page} from "@playwright/test";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class OpponentPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Where the opponent stands and how much health it has left. Throws when the game has no opponent. */
  async get(): Promise<OpponentSnapshot> {
    const {opponent} = await this.readGameState();
    if (!opponent) {
      throw new Error("The game has no opponent in it.");
    }

    return opponent;
  }

  /** Waits until the opponent has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.health < health);
  }
}
