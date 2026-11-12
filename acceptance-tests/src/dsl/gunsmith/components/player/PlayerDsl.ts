import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {PlayerPlaywright} from "@src/dsl/gunsmith/components/player/playwright/PlayerPlaywright";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The player's own character, reached as `gunsmith.player`. */
export class PlayerDsl {
  private readonly player: PlayerPlaywright;

  constructor(page: Page) {
    this.player = new PlayerPlaywright(page);
  }

  /** Holds the key that walks this way, and keeps holding it until `stopWalking`. */
  async startWalking(heading: Heading): Promise<void> {
    try {
      await this.player.startWalking(heading);
    } catch (error) {
      throw new DslError(`Failed to start walking ${heading}`, error);
    }
  }

  async stopWalking(heading: Heading): Promise<void> {
    try {
      await this.player.stopWalking(heading);
    } catch (error) {
      throw new DslError(`Failed to stop walking ${heading}`, error);
    }
  }

  /** Where the player's centre is, in tiles. */
  async getPosition(): Promise<Point> {
    try {
      return await this.player.getPosition();
    } catch (error) {
      throw new DslError("Failed to read where the player is", error);
    }
  }

  /** Moves the mouse over the place in the arena at `tile`, which is where the player now aims. */
  async aimAtTile(tile: Point): Promise<void> {
    try {
      await this.player.aimAtTile(tile);
    } catch (error) {
      throw new DslError(`Failed to aim at tile ${tile.x}, ${tile.y}`, error);
    }
  }

  /** Which way the player faces, in degrees: 0 is east, 90 is north, and it runs from -180 to 180. */
  async getAimDegrees(): Promise<number> {
    try {
      return await this.player.getAimDegrees();
    } catch (error) {
      throw new DslError("Failed to read which way the player faces", error);
    }
  }

  /** Clicks the mouse once, where it is. */
  async fire(): Promise<void> {
    try {
      await this.player.fire();
    } catch (error) {
      throw new DslError("Failed to fire", error);
    }
  }
}
