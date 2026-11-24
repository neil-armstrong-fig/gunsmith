import type {Page} from "@playwright/test";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {BulletsPlaywright} from "@src/dsl/gunsmith/components/bullets/playwright/BulletsPlaywright";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {ShotLook} from "@src/dsl/gunsmith/types/ShotLook";

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

  /** Runs a held game, in steps of `stepSeconds`, until no shot is in the air, and holds it there, so the screen shows the floor with nothing flying over it. Fails if one still is after `maxSeconds`. */
  async runUntilNoneInTheAir(request: HurtWatch): Promise<void> {
    try {
      await this.bullets.runUntilNoneInTheAir(request);
    } catch (error) {
      throw new DslError("Failed to run the game until the air was clear of shots", error);
    }
  }

  /** The shots in the air right now, each with whose it is and which way it flies, in degrees (0 is east, 90 is north). */
  async getAll(): Promise<BulletSnapshot[]> {
    try {
      return await this.bullets.getAll();
    } catch (error) {
      throw new DslError("Failed to read the bullets in the air", error);
    }
  }

  /** How a shot looks on the screen: counted by colour along it, beside it, ahead of it and past its tail. The game must be held still (`gunsmith.holdTheGame()`). */
  async getLookOnScreen(bullet: BulletSnapshot): Promise<ShotLook> {
    try {
      return await this.bullets.getLookOnScreen(bullet);
    } catch (error) {
      throw new DslError("Failed to read how the shot looks on the screen", error);
    }
  }

  /** Runs a held game on until the opponent, who fights on its own, has a shot in the air that has flown clear of its body. Fails if it has none within `maxSeconds` of the game's time. */
  async runUntilTheOpponentFires(maxSeconds: number): Promise<void> {
    try {
      await this.bullets.runUntilTheOpponentFires(maxSeconds);
    } catch (error) {
      throw new DslError("Failed to run the held game until the opponent fired", error);
    }
  }
}
