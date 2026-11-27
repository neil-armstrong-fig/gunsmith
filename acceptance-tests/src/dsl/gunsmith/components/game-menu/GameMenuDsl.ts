import type {Page} from "@playwright/test";
import {GameMenuPlaywright} from "@src/dsl/gunsmith/components/game-menu/playwright/GameMenuPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

export class GameMenuDsl {
  private readonly menu: GameMenuPlaywright;

  constructor(page: Page) {
    this.menu = new GameMenuPlaywright(page);
  }

  async backToMainMenu(): Promise<void> {
    try {
      await this.menu.backToMainMenu();
    } catch (error) {
      throw new DslError("Could not leave the match for the main menu", error);
    }
  }

  async pressBack(): Promise<void> {
    try {
      await this.menu.pressBack();
    } catch (error) {
      throw new DslError("Could not press Back in the menu", error);
    }
  }

  async loadWithoutOverride(): Promise<void> {
    try {
      await this.menu.loadWithoutOverride();
    } catch (error) {
      throw new DslError("Could not open the game without overriding the startup preference", error);
    }
  }

  async pressSettings(): Promise<void> {
    try {
      await this.menu.pressSettings();
    } catch (error) {
      throw new DslError("Could not open Settings", error);
    }
  }

  async pressEscape(): Promise<void> {
    try {
      await this.menu.pressEscape();
    } catch (error) {
      throw new DslError("Could not press Escape", error);
    }
  }

  async chooseOptions(): Promise<void> {
    try {
      await this.menu.chooseOptions();
    } catch (error) {
      throw new DslError("Could not open Options", error);
    }
  }

  async setStartupMenu(enabled: boolean): Promise<void> {
    try {
      await this.menu.setStartupMenu(enabled);
    } catch (error) {
      throw new DslError("Could not change whether the game opens the menu on startup", error);
    }
  }

  async chooseWorkshop(): Promise<void> {
    try {
      await this.menu.chooseWorkshop();
    } catch (error) {
      throw new DslError("Could not open Workshop from the menu", error);
    }
  }

  async resumePlay(): Promise<void> {
    try {
      await this.menu.resumePlay();
    } catch (error) {
      throw new DslError("Could not resume play from the menu", error);
    }
  }

  async getMainActions(): Promise<string[]> {
    try {
      return await this.menu.getMainActions();
    } catch (error) {
      throw new DslError("Could not read the Game menu actions", error);
    }
  }

  async getMainLinks(): Promise<string[]> {
    try {
      return await this.menu.getMainLinks();
    } catch (error) {
      throw new DslError("Could not read the links in the Game menu", error);
    }
  }

  async isOpen(): Promise<boolean> {
    try {
      return await this.menu.isOpen();
    } catch (error) {
      throw new DslError("Could not check whether the menu is open", error);
    }
  }

  async showsOptions(): Promise<boolean> {
    try {
      return await this.menu.showsOptions();
    } catch (error) {
      throw new DslError("Could not check whether the menu shows Options", error);
    }
  }

  async showsStartupMenuChecked(): Promise<boolean> {
    try {
      return await this.menu.showsStartupMenuChecked();
    } catch (error) {
      throw new DslError("Could not check whether the menu has Show menu on startup checked", error);
    }
  }

  async showsOnlineNotice(): Promise<boolean> {
    try {
      return await this.menu.showsOnlineNotice();
    } catch (error) {
      throw new DslError("Could not check whether the menu shows the online match notice", error);
    }
  }

  async isSettingsFocused(): Promise<boolean> {
    try {
      return await this.menu.isSettingsFocused();
    } catch (error) {
      throw new DslError("Could not check whether Settings has focus", error);
    }
  }

  async rememberTheArenaCanvas(): Promise<void> {
    try {
      await this.menu.rememberTheArenaCanvas();
    } catch (error) {
      throw new DslError("Could not remember the current arena canvas", error);
    }
  }

  async usesTheSameArenaCanvas(): Promise<boolean> {
    try {
      return await this.menu.usesTheSameArenaCanvas();
    } catch (error) {
      throw new DslError("Could not check whether the same canvas is still mounted", error);
    }
  }

  async goBackInBrowser(): Promise<void> {
    try {
      await this.menu.goBackInBrowser();
    } catch (error) {
      throw new DslError("Could not go back in the browser", error);
    }
  }

  async goForwardInBrowser(): Promise<void> {
    try {
      await this.menu.goForwardInBrowser();
    } catch (error) {
      throw new DslError("Could not go forward in the browser", error);
    }
  }

  async useLegacyStartupPreference(): Promise<void> {
    try {
      await this.menu.useLegacyStartupPreference();
    } catch (error) {
      throw new DslError("Could not save a startup preference in the earlier format", error);
    }
  }
}
