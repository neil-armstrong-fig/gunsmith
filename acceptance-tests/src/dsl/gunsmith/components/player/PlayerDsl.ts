import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {PlayerPlaywright} from "@src/dsl/gunsmith/components/player/playwright/PlayerPlaywright";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
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

  /** Holds the crouch key, and keeps holding it until `standUp`. */
  async crouch(): Promise<void> {
    try {
      await this.player.crouch();
    } catch (error) {
      throw new DslError("Failed to crouch", error);
    }
  }

  /** Lets go of the crouch key. */
  async standUp(): Promise<void> {
    try {
      await this.player.standUp();
    } catch (error) {
      throw new DslError("Failed to stand up", error);
    }
  }

  /** Takes the focus away from the window, as switching to another window does: a key held at that moment never sends its release. */
  async loseFocus(): Promise<void> {
    try {
      await this.player.loseFocus();
    } catch (error) {
      throw new DslError("Failed to take the focus away from the window", error);
    }
  }

  /** Walks this way for `seconds` of game time, in whatever stance the player is in, and stops. A wall in the way stops the player short. */
  async walkFor(heading: Heading, seconds: number): Promise<void> {
    try {
      await this.player.walkFor(heading, seconds);
    } catch (error) {
      throw new DslError(`Failed to walk ${heading} for ${seconds} seconds`, error);
    }
  }

  /**
   * Walks this way for `seconds` of game time, in whatever stance the player is in, and says how fast that was, in tiles
   * a second. The player stops again afterwards. Keep clear of walls: a wall in the way makes the answer too low.
   */
  async measureWalkingSpeed(heading: Heading, seconds: number): Promise<number> {
    try {
      return await this.player.measureWalkingSpeed(heading, seconds);
    } catch (error) {
      throw new DslError(`Failed to measure walking speed ${heading}`, error);
    }
  }

  /** How much health the player has left. */
  async getHealth(): Promise<number> {
    try {
      return await this.player.getHealth();
    } catch (error) {
      throw new DslError("Failed to read the player's health", error);
    }
  }

  /** Waits until the player has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    try {
      await this.player.waitForHealthBelow(health);
    } catch (error) {
      throw new DslError(`Failed to see the player drop below ${health} health`, error);
    }
  }

  /** Which level the player stands on: 0 is the low ground, and each stair climbed is one more. On a stair it is half way between two. */
  async getLevel(): Promise<number> {
    try {
      return await this.player.getLevel();
    } catch (error) {
      throw new DslError("Failed to read which level the player is on", error);
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

  /** How the player looks on the screen right now, counted by colour over a grid on their drawing. The player must be standing still. */
  async getLookOnScreen(): Promise<FighterLook> {
    try {
      return await this.player.getLookOnScreen();
    } catch (error) {
      throw new DslError("Failed to read how the player looks on the screen", error);
    }
  }

  /** Whether the hand in the player's drawing is on the side the player aims, so the drawing has turned with the aim. The player must be standing still. */
  async isHandOnTheFacingSide(): Promise<boolean> {
    try {
      return await this.player.isHandOnTheFacingSide();
    } catch (error) {
      throw new DslError("Failed to see which side the player's hand is drawn on", error);
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

  /** Presses the mouse button and keeps it down until `stopFiring`, so the weapon fires at its own steady rate. */
  async startFiring(): Promise<void> {
    try {
      await this.player.startFiring();
    } catch (error) {
      throw new DslError("Failed to start firing", error);
    }
  }

  async stopFiring(): Promise<void> {
    try {
      await this.player.stopFiring();
    } catch (error) {
      throw new DslError("Failed to stop firing", error);
    }
  }

  /** Taps the reload key (R). */
  async reload(): Promise<void> {
    try {
      await this.player.reload();
    } catch (error) {
      throw new DslError("Failed to reload", error);
    }
  }

  /** Taps the number key of the weapon in `slot` (1 or 2). */
  async switchTo(slot: number): Promise<void> {
    try {
      await this.player.switchTo(slot);
    } catch (error) {
      throw new DslError(`Failed to switch to the weapon in slot ${slot}`, error);
    }
  }
}
