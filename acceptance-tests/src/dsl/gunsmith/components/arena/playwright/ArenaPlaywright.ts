import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";
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

  async getSizeInTiles(): Promise<Size> {
    const {arena} = await readGameState(this.page);

    return {width: arena.width, height: arena.height};
  }
}
