import type {Page} from "@playwright/test";
import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class PickupPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** The weapon lying in the arena, as the game reports it; `undefined` when none lies there. */
  async get(): Promise<PickupSnapshot | undefined> {
    const {pickup} = await this.readGameState();

    return pickup;
  }
}
