import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** Opens the game for `GunsmithDsl.begin`; everything else the page is asked to open is `ScenarioPlaywright`'s. */
export class GunsmithPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto("/?menu=0");
    await this.waitForArena();
  }
}
