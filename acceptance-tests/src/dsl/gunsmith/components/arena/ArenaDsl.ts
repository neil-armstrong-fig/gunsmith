import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {ArenaPlaywright} from "@src/dsl/gunsmith/components/arena/playwright/ArenaPlaywright";
import type {Cursor} from "@src/dsl/gunsmith/components/arena/types/Cursor";
import type {CursorPlace} from "@src/dsl/gunsmith/components/arena/types/CursorPlace";
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

  /** The mouse cursor the browser shows while the mouse is over `place`: a picture and its hotspot, or a plain keyword. */
  async getCursorOver(place: CursorPlace): Promise<Cursor> {
    try {
      return await this.arena.getCursorOver(place);
    } catch (error) {
      throw new DslError(`Failed to read the mouse cursor over ${place}`, error);
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
