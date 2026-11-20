import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class ReferencesPlaywright extends BasePage {
  private references: Page | undefined;

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const [references] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.page.getByRole("link", {name: "References & credits"}).click(),
    ]);
    this.references = references;
  }

  async getFoleySource(): Promise<string | undefined> {
    const references = this.references;
    if (!references) throw new Error("The references page is closed");

    await references.getByRole("heading", {name: "References & credits"}).waitFor();
    await references.getByText("Greg Lester · Game Audio Learning", {exact: true}).waitFor();

    const href = await references.getByRole("link", {name: "How To Create Foley For Games"}).getAttribute("href");

    return href ?? undefined;
  }
}
