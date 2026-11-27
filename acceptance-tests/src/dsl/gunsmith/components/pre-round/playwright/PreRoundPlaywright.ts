import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {PreRoundReveal} from "@src/dsl/gunsmith/components/pre-round/types/PreRoundReveal";
import type {RevealPicture} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealPicture";
import type {RevealPictures} from "@src/dsl/gunsmith/components/pre-round/types/RevealPictures";
import type {RevealNumbers} from "@src/dsl/gunsmith/components/pre-round/types/RevealNumbers";
import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealedWeaponNumbers";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {numbersOfWeaponCard} from "@src/dsl/gunsmith/playwright/weapon-card/NumbersOfWeaponCard";
import {pictureOfWeaponCard} from "@src/dsl/gunsmith/playwright/weapon-card/PictureOfWeaponCard";

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

  /** Whether the whole of the Lock in button lies inside the dialog as it is now, without scrolling it. */
  async canLockInWithoutScrolling(): Promise<boolean> {
    const dialog = await this.dialog().boundingBox();
    const button = await this.dialog().getByRole("button", {name: "Lock in", exact: true}).boundingBox();
    if (!dialog || !button) {
      return false;
    }

    return button.y >= dialog.y && button.y + button.height <= dialog.y + dialog.height;
  }

  async isRevealShown(): Promise<boolean> {
    return await this.page.getByTestId("reveal").isVisible();
  }

  async getReveal(): Promise<PreRoundReveal> {
    await expect(this.page.getByTestId("reveal")).toBeVisible();

    return {
      yours: await this.page.getByTestId("reveal-yours").getByTestId("reveal-weapon-name").allInnerTexts(),
      opponent: await this.page.getByTestId("reveal-opponent").getByTestId("reveal-weapon-name").allInnerTexts(),
    };
  }

  async getRevealNumbers(): Promise<RevealNumbers> {
    await expect(this.page.getByTestId("reveal")).toBeVisible();

    return {
      yours: await this.numbersOfSide("reveal-yours"),
      opponent: await this.numbersOfSide("reveal-opponent"),
    };
  }

  async getRevealPictures(): Promise<RevealPictures> {
    await expect(this.page.getByTestId("reveal")).toBeVisible();

    return {
      yours: await this.picturesOfSide("reveal-yours"),
      opponent: await this.picturesOfSide("reveal-opponent"),
    };
  }

  async startTheMatch(): Promise<void> {
    await this.dialog().getByRole("button", {name: "Start the match"}).click();
    await expect(this.dialog()).toBeHidden();
  }

  private async picturesOfSide(testId: string): Promise<RevealPicture[]> {
    const pictures: RevealPicture[] = [];
    for (const weapon of await this.page.getByTestId(testId).getByTestId("reveal-weapon").all()) {
      pictures.push(await pictureOfWeaponCard(weapon));
    }

    return pictures;
  }

  private async numbersOfSide(testId: string): Promise<RevealedWeaponNumbers[]> {
    const numbers: RevealedWeaponNumbers[] = [];
    for (const weapon of await this.page.getByTestId(testId).getByTestId("reveal-weapon").all()) {
      numbers.push(await numbersOfWeaponCard(weapon));
    }

    return numbers;
  }

  private dialog(): Locator {
    return this.page.getByRole("dialog", {name: "Pre-round"});
  }

  private group(slot: number): Locator {
    return this.dialog().getByRole("group", {name: `Weapon ${slot}`});
  }
}
