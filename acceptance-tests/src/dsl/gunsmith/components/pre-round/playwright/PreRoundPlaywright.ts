import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {PreRoundReveal} from "@src/dsl/gunsmith/components/pre-round/types/PreRoundReveal";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class PreRoundPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async pressBack(): Promise<void> {
    await this.dialog().getByRole("button", {name: "Back", exact: true}).click();
  }

  async hasStartBotGame(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Start bot game"}).isVisible();
  }

  async startBotGame(): Promise<void> {
    await this.page.getByRole("button", {name: "Start bot game"}).click();
    await expect(this.dialog()).toBeVisible();
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }

  async isOpen(): Promise<boolean> {
    return await this.dialog().isVisible();
  }

  async getChoices(slot: number): Promise<string[]> {
    return await this.group(slot).getByRole("button").allInnerTexts();
  }

  async getChosen(slot: number): Promise<string> {
    return await this.group(slot).locator("button[aria-pressed=true]").innerText();
  }

  async choose(slot: number, name: string): Promise<void> {
    await this.group(slot).getByRole("button", {name, exact: true}).click();
  }

  async lockIn(): Promise<void> {
    await this.dialog().getByRole("button", {name: "Lock in"}).click();
  }

  async isRevealShown(): Promise<boolean> {
    return await this.page.getByTestId("reveal").isVisible();
  }

  async getReveal(): Promise<PreRoundReveal> {
    await expect(this.page.getByTestId("reveal")).toBeVisible();

    return {
      yours: await this.page.getByTestId("reveal-yours").getByTestId("reveal-weapon").allInnerTexts(),
      opponent: await this.page.getByTestId("reveal-opponent").getByTestId("reveal-weapon").allInnerTexts(),
    };
  }

  async startTheMatch(): Promise<void> {
    await this.dialog().getByRole("button", {name: "Start the match"}).click();
    await expect(this.dialog()).toBeHidden();
  }

  private dialog(): Locator {
    return this.page.getByRole("dialog", {name: "Pre-round"});
  }

  private group(slot: number): Locator {
    return this.dialog().getByRole("group", {name: `Weapon ${slot}`});
  }
}
