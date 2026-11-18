import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {PlayerPlaywright} from "@src/dsl/gunsmith/components/player/playwright/PlayerPlaywright";
import type {HitLook} from "@src/dsl/gunsmith/types/HitLook";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";
import type {DamageLook} from "@src/dsl/gunsmith/types/DamageLook";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {HeldWalk} from "@src/dsl/gunsmith/components/player/types/HeldWalk";
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

  /**
   * Walks in a held game (`holdTheGame`) until the player has gone past `limit` along the heading (`x` for east and west, `y` for north and south), and stops no more
   * than one step beyond it. Unlike `startWalking` then `stopWalking` after a wait, a busy machine cannot make it late.
   */
  async walkUntilPast(request: HeldWalk): Promise<void> {
    try {
      await this.player.walkUntilPast(request);
    } catch (error) {
      throw new DslError(`Failed to walk ${request.heading} past ${request.limit} in the held game`, error);
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

  /** Waits until the player has less health than `health`, for as long as `timeoutSeconds` when it is known to take longer than the default. */
  async waitForHealthBelow(health: number, timeoutSeconds?: number): Promise<void> {
    try {
      await this.player.waitForHealthBelow(health, timeoutSeconds);
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

  /** What the screen shows of damage round the player right now: the brackets of a hit either side of them, and the ring's slashes under them. The player must be standing still. */
  async getDamageOnScreen(): Promise<DamageLook> {
    try {
      return await this.player.getDamageOnScreen();
    } catch (error) {
      throw new DslError("Failed to read the damage the screen shows round the player", error);
    }
  }

  /** What the screen shows of a hit landed round the player right now (mint ticks, which belong to a target the player hit, never to the player). The player must be standing still. */
  async getHitOnScreen(): Promise<HitLook> {
    try {
      return await this.player.getHitOnScreen();
    } catch (error) {
      throw new DslError("Failed to read the hit confirmation the screen shows round the player", error);
    }
  }

  /** Runs a held game, in steps of `stepSeconds`, until the player is hurt, and holds it there. Fails if nothing hurts them in `maxSeconds`. */
  async runUntilHurt(request: HurtWatch): Promise<void> {
    try {
      await this.player.runUntilHurt(request);
    } catch (error) {
      throw new DslError("Failed to run the game until the player was hurt", error);
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
