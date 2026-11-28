import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class BrowserPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async preferReducedMotion(): Promise<void> {
    await this.page.emulateMedia({reducedMotion: "reduce"});
  }

  /** Loads the page again, as a player's reload does, and waits for the arena. What the browser stores stays; what the page holds in memory does not. */
  async reloadThePage(): Promise<void> {
    await this.page.reload();
    await this.waitForArena();
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
}
