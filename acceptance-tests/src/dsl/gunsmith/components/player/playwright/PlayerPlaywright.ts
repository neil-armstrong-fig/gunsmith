import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {screenPositionOfTile} from "@src/dsl/gunsmith/components/player/playwright/screen/ScreenPositionOfTile";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {lookOfFighter} from "@src/dsl/gunsmith/playwright/look/look-of-fighter/LookOfFighter";
import {TEAM_BLUE} from "@src/dsl/gunsmith/playwright/look/TeamBlue";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

const KEY_FOR: Record<Heading, string> = {
  north: "KeyW",
  south: "KeyS",
  east: "KeyD",
  west: "KeyA",
};

const CROUCH_KEY = "KeyC";

// Art draws the hand (`docs/art/asset-reference/players/`) 15 pixels ahead of the body's centre and 3 to its right, filled with a slate that nothing
// near it shares, at 45 pixels to a tile (the body's 18 are the hitbox's 0.4 tile).
const HAND_AHEAD_TILES = 15 / 45;
const HAND_RIGHT_TILES = 3 / 45;
const HAND_FILL: Colour = {red: 0x46, green: 0x5a, blue: 0x6b};
const TOLERANCE = 6;

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

  async walkFor(heading: Heading, seconds: number): Promise<void> {
    await this.startWalking(heading);

    const before = await this.readGameState();
    await this.waitForGameState(({elapsedSeconds}) => elapsedSeconds >= before.elapsedSeconds + seconds);

    await this.stopWalking(heading);
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

  async getLevel(): Promise<number> {
    const {player} = await this.readGameState();

    return player.level;
  }

  async getPosition(): Promise<Point> {
    const {player} = await this.readGameState();

    return {x: player.x, y: player.y};
  }

  /** What a player sees where the player stands: their drawing counted by colour, and the compass points on their outline. The player must be standing still. */
  async getLookOnScreen(): Promise<FighterLook> {
    const {player} = await this.readGameState();

    return await lookOfFighter(this.page, {x: player.x, y: player.y}, TEAM_BLUE);
  }

  /**
   * Whether the hand in the player's drawing is where the player aims: art draws the hand a third of a tile ahead of the body's centre and a fifteenth to its right
   * (the drawing faces east at rest), and it turns with the aim about that centre. The player must be standing still.
   */
  async isHandOnTheFacingSide(): Promise<boolean> {
    const {player} = await this.readGameState();
    const angle = (player.aimDegrees * Math.PI) / 180;
    const hand = {
      x: player.x + HAND_AHEAD_TILES * Math.cos(angle) + HAND_RIGHT_TILES * Math.sin(angle),
      y: player.y + HAND_AHEAD_TILES * Math.sin(angle) - HAND_RIGHT_TILES * Math.cos(angle),
    };
    const [colour] = await coloursAtTiles(this.page, [hand]);

    return colour !== undefined && colourIsNear(colour, HAND_FILL, TOLERANCE);
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
