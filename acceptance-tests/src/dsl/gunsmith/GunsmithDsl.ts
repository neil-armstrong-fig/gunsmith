import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {ArenaDsl} from "@src/dsl/gunsmith/components/arena/ArenaDsl";
import {BulletsDsl} from "@src/dsl/gunsmith/components/bullets/BulletsDsl";
import {DummiesDsl} from "@src/dsl/gunsmith/components/dummies/DummiesDsl";
import {PlayerDsl} from "@src/dsl/gunsmith/components/player/PlayerDsl";
import {GunsmithPlaywright} from "@src/dsl/gunsmith/playwright/GunsmithPlaywright";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** The whole game as a spec sees it. Every area is a member of this rather than a fixture of its own. */
export class GunsmithDsl {
  private readonly gunsmith: GunsmithPlaywright;

  readonly arena: ArenaDsl;
  readonly player: PlayerDsl;
  readonly bullets: BulletsDsl;
  readonly dummies: DummiesDsl;

  constructor(page: Page) {
    this.gunsmith = new GunsmithPlaywright(page);

    this.arena = new ArenaDsl(page);
    this.player = new PlayerDsl(page);
    this.bullets = new BulletsDsl(page);
    this.dummies = new DummiesDsl(page);
  }

  /** Opens the game and waits until the arena is on screen. */
  async begin(): Promise<void> {
    try {
      await this.bullets.startWatching();
      await this.gunsmith.open();
    } catch (error) {
      throw new DslError("Failed to open the game", error);
    }
  }

  async resizeWindowTo(size: Size): Promise<void> {
    try {
      await this.gunsmith.resizeWindowTo(size);
    } catch (error) {
      throw new DslError(`Failed to resize the window to ${size.width} by ${size.height}`, error);
    }
  }

  /** How big the browser window is, in pixels. */
  getWindowSize(): Size {
    try {
      return this.gunsmith.getWindowSize();
    } catch (error) {
      throw new DslError("Failed to read how big the window is", error);
    }
  }

  /** Waits until the game's own clock has run `seconds` further. Never sleeps: the game may run fast or slow. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    try {
      await this.gunsmith.waitForGameSeconds(seconds);
    } catch (error) {
      throw new DslError(`Failed to wait for ${seconds} seconds of game time`, error);
    }
  }
}
