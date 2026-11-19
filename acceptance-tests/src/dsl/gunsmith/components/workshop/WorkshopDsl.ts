import type {Page} from "@playwright/test";
import {WorkshopPlaywright} from "@src/dsl/gunsmith/components/workshop/playwright/WorkshopPlaywright";
import type {PowerMeter} from "@src/dsl/gunsmith/components/workshop/types/PowerMeter";
import type {PromptCount} from "@src/dsl/gunsmith/components/workshop/types/PromptCount";
import type {WeaponResult} from "@src/dsl/gunsmith/components/workshop/types/WeaponResult";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The workshop, where a player makes weapons, reached as `gunsmith.workshop`. */
export class WorkshopDsl {
  private readonly workshop: WorkshopPlaywright;

  constructor(page: Page) {
    this.workshop = new WorkshopPlaywright(page);
  }

  /** Presses the workshop's key, as a player in the practice range would. */
  async open(): Promise<void> {
    try {
      await this.workshop.open();
    } catch (error) {
      throw new DslError("Failed to open the workshop", error);
    }
  }

  /** Presses Escape, which closes the workshop. */
  async close(): Promise<void> {
    try {
      await this.workshop.close();
    } catch (error) {
      throw new DslError("Failed to close the workshop", error);
    }
  }

  /** Whether the workshop's panel is on the screen. */
  async isOpen(): Promise<boolean> {
    try {
      return await this.workshop.isOpen();
    } catch (error) {
      throw new DslError("Failed to see whether the workshop is open", error);
    }
  }

  /** Types into the prompt box key by key, so the game's own keys (W, R, 1, M, C) are pressed too. */
  async typeThePrompt(text: string): Promise<void> {
    try {
      await this.workshop.typeThePrompt(text);
    } catch (error) {
      throw new DslError("Failed to type the prompt", error);
    }
  }

  /** Puts the whole text into the prompt box at once, as a paste does. */
  async pasteThePrompt(text: string): Promise<void> {
    try {
      await this.workshop.pasteThePrompt(text);
    } catch (error) {
      throw new DslError("Failed to paste the prompt", error);
    }
  }

  /** Presses Make. */
  async make(): Promise<void> {
    try {
      await this.workshop.make();
    } catch (error) {
      throw new DslError("Failed to press Make", error);
    }
  }

  /** Presses the mouse button down on the panel's title, which is no button, and holds it. */
  async holdTheMouseOnThePanel(): Promise<void> {
    try {
      await this.workshop.holdTheMouseOnThePanel();
    } catch (error) {
      throw new DslError("Failed to hold the mouse on the panel", error);
    }
  }

  /** What is written in the prompt box. */
  async getPrompt(): Promise<string> {
    try {
      return await this.workshop.getPrompt();
    } catch (error) {
      throw new DslError("Failed to read the prompt", error);
    }
  }

  /** The prompt box's count of characters against its limit, and whether it says the text is too long. */
  async getPromptCount(): Promise<PromptCount> {
    try {
      return await this.workshop.getPromptCount();
    } catch (error) {
      throw new DslError("Failed to read the prompt's count", error);
    }
  }

  /** Whether the Make button can be pressed. */
  async canMake(): Promise<boolean> {
    try {
      return await this.workshop.canMake();
    } catch (error) {
      throw new DslError("Failed to see whether Make can be pressed", error);
    }
  }

  /** Whether a result card is on the screen. */
  async hasResult(): Promise<boolean> {
    try {
      return await this.workshop.hasResult();
    } catch (error) {
      throw new DslError("Failed to see whether there is a result card", error);
    }
  }

  /** The result card: the weapon's name, power rating, stats and drawing. */
  async getResult(): Promise<WeaponResult> {
    try {
      return await this.workshop.getResult();
    } catch (error) {
      throw new DslError("Failed to read the result card", error);
    }
  }

  async getPowerMeter(): Promise<PowerMeter> {
    try {
      return await this.workshop.getPowerMeter();
    } catch (error) {
      throw new DslError("Failed to read the power meter on the result card", error);
    }
  }
}
