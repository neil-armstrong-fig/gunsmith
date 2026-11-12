import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {BulletsPlaywright} from "@src/dsl/gunsmith/components/bullets/playwright/BulletsPlaywright";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The shots in the air, reached as `gunsmith.bullets`. */
export class BulletsDsl {
  private readonly bullets: BulletsPlaywright;

  constructor(page: Page) {
    this.bullets = new BulletsPlaywright(page);
  }

  /** Begins noting every shot from page load, so `waitForABullet` cannot miss one that was fired and gone already. */
  async startWatching(): Promise<void> {
    try {
      await this.bullets.startWatching();
    } catch (error) {
      throw new DslError("Failed to start watching for bullets", error);
    }
  }

  /** Waits until a shot has been seen in the air and says where the first one was when it was first seen, in tiles. */
  async waitForABullet(): Promise<Point> {
    try {
      return await this.bullets.waitForABullet();
    } catch (error) {
      throw new DslError("Failed to see a bullet in the air", error);
    }
  }

  /** Waits until no shot is in the air. Call it after `waitForABullet`, or it can pass before the shot has left. */
  async waitForNoBullets(): Promise<void> {
    try {
      await this.bullets.waitForNoBullets();
    } catch (error) {
      throw new DslError("Failed to see every bullet leave the air", error);
    }
  }

  /** How many shots are in the air right now. */
  async count(): Promise<number> {
    try {
      return await this.bullets.count();
    } catch (error) {
      throw new DslError("Failed to count the bullets in the air", error);
    }
  }
}
