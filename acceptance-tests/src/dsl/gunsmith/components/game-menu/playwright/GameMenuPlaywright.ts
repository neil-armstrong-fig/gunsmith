import type {ElementHandle, Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class GameMenuPlaywright extends BasePage {
  private arenaCanvas: ElementHandle | undefined;
  private documentStartedAt: number | undefined;

  constructor(page: Page) {
    super(page);
  }

  async backToMainMenu(): Promise<void> {
    await this.panel().getByRole("button", {name: "Back to main menu", exact: true}).click();
  }

  async pressBack(): Promise<void> {
    await this.panel().getByRole("button", {name: "Back", exact: true}).click();
  }

  async loadWithoutOverride(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }

  async pressSettings(): Promise<void> {
    await this.page.getByRole("button", {name: "Settings", exact: true}).click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async chooseOptions(): Promise<void> {
    await this.panel().getByRole("button", {name: "Options", exact: true}).click();
  }

  async setStartupMenu(enabled: boolean): Promise<void> {
    await this.panel().getByRole("checkbox", {name: "Show menu on startup"}).setChecked(enabled);
  }

  async chooseWorkshop(): Promise<void> {
    await this.panel().getByRole("button", {name: "Workshop", exact: true}).click();
  }

  async resumePlay(): Promise<void> {
    await this.panel().getByRole("button", {name: "Resume", exact: true}).click();
  }

  async getMainActions(): Promise<string[]> {
    return await this.panel().getByRole("button").allInnerTexts();
  }

  async getMainLinks(): Promise<string[]> {
    return await this.panel().getByRole("link").allInnerTexts();
  }

  async isOpen(): Promise<boolean> {
    return await this.panel().isVisible();
  }

  async showsOptions(): Promise<boolean> {
    return await this.panel().getByRole("heading", {name: "Options", exact: true}).isVisible();
  }

  async showsStartupMenuChecked(): Promise<boolean> {
    return await this.panel().getByRole("checkbox", {name: "Show menu on startup"}).isChecked();
  }

  async showsOnlineNotice(): Promise<boolean> {
    return await this.panel().getByText("The match continues while this menu is open.", {exact: true}).isVisible();
  }

  async isSettingsFocused(): Promise<boolean> {
    return await this.page.getByRole("button", {name: "Settings", exact: true}).evaluate(button => {
      return document.activeElement === button;
    });
  }

  async rememberTheArenaCanvas(): Promise<void> {
    this.documentStartedAt = await this.page.evaluate(() => performance.timeOrigin);
    this.arenaCanvas = await this.page.getByTestId("arena").locator("canvas").elementHandle();
  }

  async usesTheSameArenaCanvas(): Promise<boolean> {
    const canvas = this.arenaCanvas;
    if (!canvas) return false;

    if ((await this.page.evaluate(() => performance.timeOrigin)) !== this.documentStartedAt) return false;

    return await canvas.evaluate(element => element.isConnected);
  }

  async goBackInBrowser(): Promise<void> {
    await this.page.goBack();
  }

  async goForwardInBrowser(): Promise<void> {
    await this.page.goForward();
  }

  async useLegacyStartupPreference(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.setItem("gunsmith.showMenuOnStartup", "false");
    });
  }

  private panel(): Locator {
    return this.page.getByRole("dialog", {name: "Game menu", exact: true});
  }
}
