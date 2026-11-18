import type {Page} from "@playwright/test";
import type {RingSnapshot} from "@gunsmith/shared/state-hook/types/RingSnapshot";
import {RingPlaywright} from "@src/dsl/gunsmith/components/ring/playwright/RingPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The round's closing ring and the countdown to it, reached as `gunsmith.ring`. */
export class RingDsl {
  private readonly ring: RingPlaywright;

  constructor(page: Page) {
    this.ring = new RingPlaywright(page);
  }

  /** The ring as the game itself reports it: the seconds of the round still to play before it starts to close. */
  async get(): Promise<RingSnapshot> {
    try {
      return await this.ring.get();
    } catch (error) {
      throw new DslError("Failed to read the ring", error);
    }
  }

  /** Whether the game has a ring at all; the practice range and sparring have none. */
  async exists(): Promise<boolean> {
    try {
      return await this.ring.exists();
    } catch (error) {
      throw new DslError("Failed to see whether the game has a ring", error);
    }
  }

  /** Waits until the ring has started to close, for as long as `timeoutSeconds` when that is known to take longer than the default. */
  async waitForClosing(timeoutSeconds?: number): Promise<void> {
    try {
      await this.ring.waitForClosing(timeoutSeconds);
    } catch (error) {
      throw new DslError("Failed to see the ring start to close", error);
    }
  }

  /** Waits until the safe ground reaches less than `radius` tiles from the ring's centre. */
  async waitForRadiusBelow(radius: number, timeoutSeconds?: number): Promise<void> {
    try {
      await this.ring.waitForRadiusBelow(radius, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to see the ring close in to under ${radius} tiles`, error);
    }
  }

  /** Whether the countdown over the arena says "Ring closing", once the screen has caught up with the game. */
  async isClosingOnScreen(): Promise<boolean> {
    try {
      return await this.ring.isClosingOnScreen();
    } catch (error) {
      throw new DslError("Failed to see the screen say the ring is closing", error);
    }
  }

  /** The shader errors the browser has reported since the page was opened: none when the ring's shader compiled. */
  getShaderErrors(): string[] {
    try {
      return this.ring.getShaderErrors();
    } catch (error) {
      throw new DslError("Failed to read the shader errors", error);
    }
  }

  /** Whether a bright red line is on the screen where the game says the ring's edge is (a screenshot: what a player sees). */
  async isEdgeDrawn(): Promise<boolean> {
    try {
      return await this.ring.isEdgeDrawn();
    } catch (error) {
      throw new DslError("Failed to see whether the ring's edge is drawn", error);
    }
  }

  /** Whether the bright red of the ring's edge is on the screen in any corner of the arena (a screenshot: what a player sees). */
  async isRedDrawnInAnyCorner(): Promise<boolean> {
    try {
      return await this.ring.isRedDrawnInAnyCorner();
    } catch (error) {
      throw new DslError("Failed to see whether the ring is drawn in a corner of the arena", error);
    }
  }

  /** Whether the ground at the ring's centre is drawn without the ring's red tint. */
  async isInsideUntinted(): Promise<boolean> {
    try {
      return await this.ring.isInsideUntinted();
    } catch (error) {
      throw new DslError("Failed to see whether the inside of the ring is untinted", error);
    }
  }

  /** Whether the ground just outside the ring's edge is drawn with the ring's red tint. */
  async isOutsideTinted(): Promise<boolean> {
    try {
      return await this.ring.isOutsideTinted();
    } catch (error) {
      throw new DslError("Failed to see whether the outside of the ring is tinted", error);
    }
  }

  /** The words the countdown over the arena shows. */
  async getCountdownOnScreen(): Promise<string> {
    try {
      return await this.ring.getCountdownOnScreen();
    } catch (error) {
      throw new DslError("Failed to read the ring's countdown on the screen", error);
    }
  }

  /** Whether the countdown is on the screen right now. */
  async isCountdownOnScreen(): Promise<boolean> {
    try {
      return await this.ring.isCountdownOnScreen();
    } catch (error) {
      throw new DslError("Failed to see whether the ring's countdown is on the screen", error);
    }
  }
}
