import type {Page} from "@playwright/test";
import {HudPlaywright} from "@src/dsl/gunsmith/components/hud/playwright/HudPlaywright";
import type {HudAmmo} from "@src/dsl/gunsmith/components/hud/types/HudAmmo";
import type {HealthBorder} from "@src/dsl/gunsmith/components/hud/types/HealthBorder";
import type {HudMotion} from "@src/dsl/gunsmith/components/hud/types/HudMotion";
import type {InventoryIconLook} from "@src/dsl/gunsmith/components/hud/types/InventoryIconLook";
import type {InventoryReadout} from "@src/dsl/gunsmith/components/hud/types/InventoryReadout";
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

  async getInventory(): Promise<InventoryReadout> {
    try {
      return await this.hud.getInventory();
    } catch (error) {
      throw new DslError("Failed to read the weapon inventory on the screen", error);
    }
  }

  async getInventoryIconLook(slot: number): Promise<InventoryIconLook> {
    try {
      return await this.hud.getInventoryIconLook(slot);
    } catch (error) {
      throw new DslError(`Failed to read the drawing in weapon slot ${slot}`, error);
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

  /** The health the screen shows the player. */
  async getHealth(): Promise<number> {
    try {
      return await this.hud.getHealth();
    } catch (error) {
      throw new DslError("Failed to read the health on the screen", error);
    }
  }

  /** Waits until the screen shows exactly `health`. */
  async waitForHealth(health: number): Promise<void> {
    try {
      await this.hud.waitForHealth(health);
    } catch (error) {
      throw new DslError(`Failed to see ${health} health on the screen`, error);
    }
  }

  /** Waits until the screen shows the health the game itself says the player has, however often they are being hit. */
  async waitForHealthToMatchTheGame(): Promise<void> {
    try {
      await this.hud.waitForHealthToMatchTheGame();
    } catch (error) {
      throw new DslError("Failed to see the screen show the player's health as the game has it", error);
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

  /** Begins noting every flash and slide on the screen from page load, so a short one cannot be missed. */
  async startWatching(): Promise<void> {
    try {
      await this.hud.startWatching();
    } catch (error) {
      throw new DslError("Failed to start watching the screen for motion", error);
    }
  }

  /** Every time the element with this `data-testid` has begun to flash or slide, in order, with how long it was set to last. */
  async getMotions(testId: string): Promise<readonly HudMotion[]> {
    try {
      return await this.hud.getMotions(testId);
    } catch (error) {
      throw new DslError(`Failed to read the motions of ${testId}`, error);
    }
  }

  /** The border round the health panel: red while the ring is hurting the player, and none otherwise. */
  async getHealthBorder(): Promise<HealthBorder> {
    try {
      return await this.hud.getHealthBorder();
    } catch (error) {
      throw new DslError("Failed to read the border round the health panel", error);
    }
  }

  /** Waits until the health panel has its red border. */
  async waitForBorder(): Promise<void> {
    try {
      await this.hud.waitForBorder();
    } catch (error) {
      throw new DslError("Failed to see the health panel get its red border", error);
    }
  }

  /** Waits until the health panel has no border. */
  async waitForNoBorder(): Promise<void> {
    try {
      await this.hud.waitForNoBorder();
    } catch (error) {
      throw new DslError("Failed to see the health panel lose its red border", error);
    }
  }

  /** The colour the lost part of the health bar is drawn in, as the browser computes it (`rgb(r, g, b)`). */
  async getTrailColour(): Promise<string> {
    try {
      return await this.hud.getTrailColour();
    } catch (error) {
      throw new DslError("Failed to read the colour of the health trail", error);
    }
  }

  /** Whether the trail behind the health bar is as long as the bar, measured at one instant: false while it is still catching up. */
  async isTrailAtTheBar(): Promise<boolean> {
    try {
      return await this.hud.isTrailAtTheBar();
    } catch (error) {
      throw new DslError("Failed to compare the health trail with the health bar", error);
    }
  }
}
