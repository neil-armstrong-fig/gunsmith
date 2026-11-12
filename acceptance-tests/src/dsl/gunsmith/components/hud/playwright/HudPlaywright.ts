import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {HudAmmo} from "@src/dsl/gunsmith/components/hud/types/HudAmmo";
import type {MagazineBar} from "@src/dsl/gunsmith/components/hud/types/MagazineBar";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class HudPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getAmmo(): Promise<HudAmmo> {
    return {
      slot: await this.numberIn("weapon-slot"),
      rounds: await this.numberIn("ammo-rounds"),
      reserve: await this.numberIn("ammo-reserve"),
      reloading: (await this.hud().getAttribute("data-reloading")) === "true",
    };
  }

  async getMagazineBar(): Promise<MagazineBar> {
    const segments = this.page.getByTestId("magazine-segment");

    return {
      segments: await segments.count(),
      filled: await segments.evaluateAll(
        elements => elements.filter(element => element.getAttribute("data-loaded") === "true").length,
      ),
    };
  }

  async waitForRounds(rounds: number): Promise<void> {
    await expect(this.page.getByTestId("ammo-rounds")).toHaveText(String(rounds));
  }

  async waitForSlot(slot: number): Promise<void> {
    await expect(this.page.getByTestId("weapon-slot")).toHaveText(String(slot));
  }

  async waitForReloadToStart(): Promise<void> {
    await expect(this.hud()).toHaveAttribute("data-reloading", "true");
  }

  async waitForReloadToEnd(): Promise<void> {
    await expect(this.hud()).toHaveAttribute("data-reloading", "false");
  }

  private hud(): Locator {
    return this.page.getByTestId("ammo-hud");
  }

  private async numberIn(testId: string): Promise<number> {
    const text = await this.page.getByTestId(testId).textContent();
    if (text === null) {
      throw new Error(`The screen shows nothing in "${testId}".`);
    }

    return Number(text);
  }
}
