import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {ArenaPlaywright} from "@src/dsl/gunsmith/components/arena/playwright/ArenaPlaywright";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** The arena the match is played in, reached as `gunsmith.arena`. */
export class ArenaDsl {
  private readonly arena: ArenaPlaywright;

  constructor(page: Page) {
    this.arena = new ArenaPlaywright(page);
  }

  /** How big the arena is drawn on screen, in pixels. */
  async getSizeOnScreen(): Promise<Size> {
    try {
      return await this.arena.getSizeOnScreen();
    } catch (error) {
      throw new DslError("Failed to read how big the arena is drawn", error);
    }
  }

  /** How many tiles wide and high the arena is. */
  async getSizeInTiles(): Promise<Size> {
    try {
      return await this.arena.getSizeInTiles();
    } catch (error) {
      throw new DslError("Failed to read how many tiles the arena has", error);
    }
  }
}
