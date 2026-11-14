import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {screenPositionOfTile} from "@src/dsl/gunsmith/components/player/playwright/screen/ScreenPositionOfTile";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {Point} from "@src/dsl/gunsmith/types/Point";

const KEY_FOR: Record<Heading, string> = {
  north: "KeyW",
  south: "KeyS",
  east: "KeyD",
  west: "KeyA",
};

const CROUCH_KEY = "KeyC";

export class PlayerPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async startWalking(heading: Heading): Promise<void> {
    await this.page.keyboard.down(KEY_FOR[heading]);
  }

  async stopWalking(heading: Heading): Promise<void> {
    await this.page.keyboard.up(KEY_FOR[heading]);
  }

  async crouch(): Promise<void> {
    await this.page.keyboard.down(CROUCH_KEY);
  }

  async standUp(): Promise<void> {
    await this.page.keyboard.up(CROUCH_KEY);
  }

  async loseFocus(): Promise<void> {
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event("blur"));
    });
  }

  async measureWalkingSpeed(heading: Heading, seconds: number): Promise<number> {
    await this.startWalking(heading);

    const before = await this.readGameState();
    await this.waitForGameState(({elapsedSeconds}) => elapsedSeconds >= before.elapsedSeconds + seconds);
    const after = await this.readGameState();

    await this.stopWalking(heading);

    const tiles = Math.hypot(after.player.x - before.player.x, after.player.y - before.player.y);

    return tiles / (after.elapsedSeconds - before.elapsedSeconds);
  }

  async getHealth(): Promise<number> {
    const {player} = await this.readGameState();

    return player.health;
  }

  /** Waits until the player has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    await this.waitForGameState(({player}) => player.health < health);
  }

  async getPosition(): Promise<Point> {
    const {player} = await this.readGameState();

    return {x: player.x, y: player.y};
  }

  async aimAtTile(tile: Point): Promise<void> {
    const pixel = await screenPositionOfTile(this.page, tile);

    await this.page.mouse.move(pixel.x, pixel.y);
  }

  async getAimDegrees(): Promise<number> {
    const {player} = await this.readGameState();

    return player.aimDegrees;
  }

  async fire(): Promise<void> {
    await this.page.mouse.down();
    await this.page.mouse.up();
  }

  async startFiring(): Promise<void> {
    await this.page.mouse.down();
  }

  async stopFiring(): Promise<void> {
    await this.page.mouse.up();
  }

  async reload(): Promise<void> {
    await this.page.keyboard.press("KeyR");
  }

  async switchTo(slot: number): Promise<void> {
    await this.page.keyboard.press(`Digit${slot}`);
  }
}
