import type {ArenaWorkshopSetup} from "@src/dsl/gunsmith/components/workshop/components/arenas/types/ArenaWorkshopSetup";
import type {Page} from "@playwright/test";
import {ArenaWorkshopPlaywright} from "@src/dsl/gunsmith/components/workshop/components/arenas/playwright/ArenaWorkshopPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class ArenaWorkshopDsl {
  private readonly arenas: ArenaWorkshopPlaywright;

  constructor(page: Page) {
    this.arenas = new ArenaWorkshopPlaywright(page);
  }

  async arrangeSignedInArena(setup: ArenaWorkshopSetup = "ready"): Promise<void> {
    try {
      await this.arenas.arrangeSignedInArena(setup);
    } catch (error) {
      throw new DslError("Failed to arrange a signed-in arena workshop", error);
    }
  }

  async getMakeError(): Promise<string> {
    try {
      return await this.arenas.getMakeError();
    } catch (error) {
      throw new DslError("Failed to read the arena generation error", error);
    }
  }

  async open(name?: string): Promise<void> {
    try {
      await this.arenas.open(name);
    } catch (error) {
      throw new DslError("Failed to open the arena workshop", error);
    }
  }

  async chooseStyle(name: string): Promise<void> {
    try {
      await this.arenas.chooseStyle(name);
    } catch (error) {
      throw new DslError(`Failed to choose the ${name} style in the arena workshop`, error);
    }
  }

  async getPromptBorderColour(): Promise<string> {
    try {
      return await this.arenas.getPromptBorderColour();
    } catch (error) {
      throw new DslError("Failed to read the border of the arena prompt", error);
    }
  }

  async pressStyleWord(word: string): Promise<void> {
    try {
      await this.arenas.pressStyleWord(word);
    } catch (error) {
      throw new DslError(`Failed to press the word ${word} in the style switch`, error);
    }
  }

  async isStyleChosen(name: string): Promise<boolean> {
    try {
      return await this.arenas.isStyleChosen(name);
    } catch (error) {
      throw new DslError(`Failed to read whether the ${name} style is chosen`, error);
    }
  }

  async pressArenaAction(name: string, index = 0): Promise<void> {
    try {
      await this.arenas.pressArenaAction(name, index);
    } catch (error) {
      throw new DslError(`Failed to press ${name} in the arena workshop`, error);
    }
  }

  async getSavedArenaPrompts(): Promise<string[]> {
    try {
      return await this.arenas.getSavedArenaPrompts();
    } catch (error) {
      throw new DslError("Failed to read the saved arena prompts", error);
    }
  }

  async getSavedArenaColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    try {
      return await this.arenas.getSavedArenaColours(name, size, points);
    } catch (error) {
      throw new DslError("Failed to see the saved arena drawing", error);
    }
  }

  async getResultColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    try {
      return await this.arenas.getResultColours(name, size, points);
    } catch (error) {
      throw new DslError("Failed to see the arena result drawing", error);
    }
  }

  async getBuiltInColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    try {
      return await this.arenas.getBuiltInColours(name, size, points);
    } catch (error) {
      throw new DslError("Failed to see the built-in arena drawing", error);
    }
  }

  async usesWebGl(name: string): Promise<boolean> {
    try {
      return await this.arenas.usesWebGl(name);
    } catch (error) {
      throw new DslError("Failed to check the arena preview renderer", error);
    }
  }

  async getVisibleResultFraction(): Promise<number> {
    try {
      return await this.arenas.getVisibleResultFraction();
    } catch (error) {
      throw new DslError("Failed to check how much of the arena result is visible", error);
    }
  }

  async hasResult(): Promise<boolean> {
    try {
      return await this.arenas.hasResult();
    } catch (error) {
      throw new DslError("Failed to read whether an arena result is shown", error);
    }
  }

  async getResultDescription(): Promise<string> {
    try {
      return await this.arenas.getResultDescription();
    } catch (error) {
      throw new DslError("Failed to read the arena result", error);
    }
  }
}
