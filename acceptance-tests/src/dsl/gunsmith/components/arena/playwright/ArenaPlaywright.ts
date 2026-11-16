import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class ArenaPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getSizeOnScreen(): Promise<Size> {
    const box = await this.page.getByTestId("arena").locator("canvas").boundingBox();
    if (!box) {
      throw new Error("The arena is not on the page.");
    }

    return {width: Math.round(box.width), height: Math.round(box.height)};
  }

  /** Whether the arena says it is still waiting for art's pictures (`data-sprites-ready` is false); waits a moment for the page to say so. */
  async isWaitingForPictures(): Promise<boolean> {
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-sprites-ready", "false");

    return true;
  }

  async getSizeInTiles(): Promise<Size> {
    const {arena} = await this.readGameState();

    return {width: arena.width, height: arena.height};
  }
}
