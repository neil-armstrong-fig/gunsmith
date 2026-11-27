import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {RevealedArena} from "@src/dsl/gunsmith/components/pre-round/components/arena/types/RevealedArena";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

const LAYOUT_SUFFIX = " arena layout";

export class ArenaPreRoundPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getChoices(): Promise<string[]> {
    return await this.group().getByRole("button").allInnerTexts();
  }

  /** How many arena buttons are in each row on the screen, top row first, read from where each is drawn. */
  async getChoicesInEachRow(): Promise<number[]> {
    const rows = new Map<number, number>();
    for (const button of await this.group().getByRole("button").all()) {
      const box = await button.boundingBox();
      if (box) {
        const top = Math.round(box.y);
        rows.set(top, (rows.get(top) ?? 0) + 1);
      }
    }

    return [...rows.entries()].sort(([first], [second]) => first - second).map(([, count]) => count);
  }

  async getChosen(): Promise<string> {
    return await this.group().locator("button[aria-pressed=true]").innerText();
  }

  async choose(name: string): Promise<void> {
    await this.group().getByRole("button", {name, exact: true}).click();
  }

  async getPreviewName(): Promise<string> {
    const label = (await this.group().getByRole("img").first().getAttribute("aria-label")) ?? "";

    return label.replace(LAYOUT_SUFFIX, "");
  }

  async getReveal(): Promise<RevealedArena> {
    const reveal = this.page.getByTestId("reveal-arena");
    await expect(reveal).toBeVisible();

    return {
      name: await reveal.getByTestId("reveal-arena-name").innerText(),
    };
  }

  private dialog(): Locator {
    return this.page.getByRole("dialog", {name: "Pre-round"});
  }

  private group(): Locator {
    return this.dialog().getByRole("group", {name: "Arena", exact: true});
  }
}
