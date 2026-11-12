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
