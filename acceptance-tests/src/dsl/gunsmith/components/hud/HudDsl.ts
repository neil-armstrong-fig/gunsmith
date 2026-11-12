import type {Page} from "@playwright/test";
import {HudPlaywright} from "@src/dsl/gunsmith/components/hud/playwright/HudPlaywright";
import type {HudAmmo} from "@src/dsl/gunsmith/components/hud/types/HudAmmo";
import type {MagazineBar} from "@src/dsl/gunsmith/components/hud/types/MagazineBar";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** What the player sees on the screen over the arena, reached as `gunsmith.hud`. */
export class HudDsl {
  private readonly hud: HudPlaywright;

  constructor(page: Page) {
    this.hud = new HudPlaywright(page);
  }

  /** The weapon slot, magazine, reserve and reload state the screen shows. */
  async getAmmo(): Promise<HudAmmo> {
    try {
      return await this.hud.getAmmo();
    } catch (error) {
      throw new DslError("Failed to read the ammunition on the screen", error);
    }
  }

  /** How many segments the magazine bar has, and how many of them are filled. */
  async getMagazineBar(): Promise<MagazineBar> {
    try {
      return await this.hud.getMagazineBar();
    } catch (error) {
      throw new DslError("Failed to read the magazine bar on the screen", error);
    }
  }

  /** Waits until the screen shows exactly `rounds` in the magazine. */
  async waitForRounds(rounds: number): Promise<void> {
    try {
      await this.hud.waitForRounds(rounds);
    } catch (error) {
      throw new DslError(`Failed to see ${rounds} rounds in the magazine on the screen`, error);
    }
  }

  /** Waits until the screen shows the weapon in `slot`. */
  async waitForSlot(slot: number): Promise<void> {
    try {
      await this.hud.waitForSlot(slot);
    } catch (error) {
      throw new DslError(`Failed to see the weapon in slot ${slot} on the screen`, error);
    }
  }

  /** Waits until the screen says the weapon is being reloaded. */
  async waitForReloadToStart(): Promise<void> {
    try {
      await this.hud.waitForReloadToStart();
    } catch (error) {
      throw new DslError("Failed to see the screen say the weapon is reloading", error);
    }
  }

  /** Waits until the screen says the weapon is not being reloaded. Call it after `waitForReloadToStart`, or it passes at once. */
  async waitForReloadToEnd(): Promise<void> {
    try {
      await this.hud.waitForReloadToEnd();
    } catch (error) {
      throw new DslError("Failed to see the screen say the reload is over", error);
    }
  }
}
