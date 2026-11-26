import type {Page} from "@playwright/test";
import {ArenaPreRoundPlaywright} from "@src/dsl/gunsmith/components/pre-round/components/arena/playwright/ArenaPreRoundPlaywright";
import type {RevealedArena} from "@src/dsl/gunsmith/components/pre-round/components/arena/types/RevealedArena";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The arena's part of the pre-round: the choice beside the weapons and the arena on the reveal, reached as `gunsmith.preRound.arena`. */
export class ArenaPreRoundDsl {
  private readonly arena: ArenaPreRoundPlaywright;

  constructor(page: Page) {
    this.arena = new ArenaPreRoundPlaywright(page);
  }

  /** The names offered for the arena, built-ins first and then the shelf. */
  async getChoices(): Promise<string[]> {
    try {
      return await this.arena.getChoices();
    } catch (error) {
      throw new DslError("Failed to read the arena choices", error);
    }
  }

  /** How many arenas are laid out in each row on the screen, top row first. */
  async getChoicesInEachRow(): Promise<number[]> {
    try {
      return await this.arena.getChoicesInEachRow();
    } catch (error) {
      throw new DslError("Failed to read how many arenas are in a row", error);
    }
  }

  /** The name of the arena chosen right now. */
  async getChosen(): Promise<string> {
    try {
      return await this.arena.getChosen();
    } catch (error) {
      throw new DslError("Failed to read the arena choice", error);
    }
  }

  /** Chooses the arena with `name`. */
  async choose(name: string): Promise<void> {
    try {
      await this.arena.choose(name);
    } catch (error) {
      throw new DslError(`Failed to choose the arena ${name}`, error);
    }
  }

  /** The name of the arena the choosing's preview shows. */
  async getPreviewName(): Promise<string> {
    try {
      return await this.arena.getPreviewName();
    } catch (error) {
      throw new DslError("Failed to read the arena preview's name", error);
    }
  }

  /** The arena the reveal shows. */
  async getReveal(): Promise<RevealedArena> {
    try {
      return await this.arena.getReveal();
    } catch (error) {
      throw new DslError("Failed to read the arena on the reveal", error);
    }
  }
}
