import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {ShelfItem} from "@src/dsl/gunsmith/components/workshop/components/shelf/types/ShelfItem";
import type {ShelfMeter} from "@src/dsl/gunsmith/components/workshop/components/shelf/types/ShelfMeter";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class ShelfPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async save(): Promise<void> {
    await this.card().getByRole("button", {name: "Save", exact: true}).click();
  }

  async getSaveError(): Promise<string | undefined> {
    const error = this.card().getByRole("alert");
    if (!(await error.isVisible())) return undefined;

    return await error.innerText();
  }

  async canSave(): Promise<boolean> {
    const save = this.card().getByRole("button", {name: "Save", exact: true});

    return (await save.isVisible()) && (await save.isEnabled());
  }

  async isSaved(): Promise<boolean> {
    return await this.card().getByRole("button", {name: "Saved", exact: true}).isVisible();
  }

  async getMeter(): Promise<ShelfMeter> {
    const text = await this.page.getByTestId("shelf-count").innerText();
    const [count, limit] = text.split(" of ").map(part => Number.parseInt(part.trim(), 10));

    return {count: count ?? Number.NaN, limit: limit ?? Number.NaN};
  }

  async getItems(): Promise<ShelfItem[]> {
    const items: ShelfItem[] = [];
    for (const item of await this.page.getByTestId("shelf-item").all()) {
      items.push({
        name: await this.textOf(item.getByTestId("shelf-item-name")),
        rating: Number.parseInt(await this.textOf(item.getByTestId("shelf-item-rating")), 10),
        prompt: await this.textOf(item.getByTestId("shelf-item-prompt")),
      });
    }

    return items;
  }

  async tryItem(index: number): Promise<void> {
    await this.item(index).getByRole("button", {name: "Try it"}).click();
  }

  async iterateItem(index: number): Promise<void> {
    await this.item(index).getByRole("button", {name: "Iterate"}).click();
  }

  async deleteItem(index: number): Promise<void> {
    await this.item(index).getByRole("button", {name: "Delete"}).click();
  }

  async isAskingWhichToReplace(): Promise<boolean> {
    return await this.page.getByRole("group", {name: "Replace which weapon?"}).isVisible();
  }

  async getReplacementPrompts(): Promise<string[]> {
    const prompts = this.page
      .getByRole("group", {name: "Replace which weapon?"})
      .getByTestId("shelf-item-prompt")
      .filter({visible: true});

    for (const prompt of await prompts.all()) {
      await expect
        .poll(() => prompt.evaluate(element => element.scrollHeight - element.clientHeight))
        .toBeLessThanOrEqual(1);
    }

    return await prompts.allInnerTexts();
  }

  async replaceItem(index: number): Promise<void> {
    await this.page
      .getByRole("group", {name: "Replace which weapon?"})
      .getByRole("button", {name: "Replace"})
      .nth(index)
      .click();
  }

  async cancelReplace(): Promise<void> {
    await this.page.getByRole("group", {name: "Replace which weapon?"}).getByRole("button", {name: "Cancel"}).click();
  }

  private card(): Locator {
    return this.page.getByTestId("workshop-result");
  }

  private item(index: number): Locator {
    return this.page.getByTestId("shelf-item").nth(index);
  }

  private async textOf(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }
}
