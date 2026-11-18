import type {Page} from "@playwright/test";
import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import {DummiesPlaywright} from "@src/dsl/gunsmith/components/dummies/playwright/DummiesPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
import type {HitLook} from "@src/dsl/gunsmith/types/HitLook";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The practice dummies, reached as `gunsmith.dummies`. */
export class DummiesDsl {
  private readonly dummies: DummiesPlaywright;

  constructor(page: Page) {
    this.dummies = new DummiesPlaywright(page);
  }

  /** Every dummy still standing, with where it stands in tiles and how much health it has left. */
  async getAll(): Promise<DummySnapshot[]> {
    try {
      return await this.dummies.getAll();
    } catch (error) {
      throw new DslError("Failed to read the dummies", error);
    }
  }

  /** How much health the dummy standing at `place` has left; `undefined` when no dummy stands there. */
  async getHealthAt(place: Point): Promise<number | undefined> {
    try {
      return await this.dummies.getHealthAt(place);
    } catch (error) {
      throw new DslError(`Failed to read the health of the dummy at ${place.x}, ${place.y}`, error);
    }
  }

  /** Whether the player sees the dummy standing at `place`: inside their cone, with no wall or higher ground in the way. */
  async isSeenAt(place: Point): Promise<boolean> {
    try {
      return await this.dummies.isSeenAt(place);
    } catch (error) {
      throw new DslError(`Failed to read whether the dummy at ${place.x}, ${place.y} is seen`, error);
    }
  }

  /** How the dummy standing at `place` looks on the screen right now, counted by colour over a grid on its drawing; one the player does not see shows none of it. */
  async getLookOnScreen(place: Point): Promise<FighterLook> {
    try {
      return await this.dummies.getLookOnScreen(place);
    } catch (error) {
      throw new DslError(`Failed to read how the dummy at ${place.x}, ${place.y} looks on the screen`, error);
    }
  }

  /** What the screen shows of a hit landed round `place`, where a dummy stood: the mint ticks at its corners. */
  async getHitOnScreen(place: Point): Promise<HitLook> {
    try {
      return await this.dummies.getHitOnScreen(place);
    } catch (error) {
      throw new DslError(`Failed to read the hit confirmation the screen shows round ${place.x}, ${place.y}`, error);
    }
  }

  /** Runs a held game, in steps of `stepSeconds`, until the dummy at `dummy` has been hurt or felled (seen or not), and holds it there. Fails if nothing does so in `maxSeconds`. */
  async runUntilHurt(dummy: Point, request: HurtWatch): Promise<void> {
    try {
      await this.dummies.runUntilHurt(dummy, request);
    } catch (error) {
      throw new DslError(`Failed to run the game until the dummy at ${dummy.x}, ${dummy.y} was hurt`, error);
    }
  }

  /** Waits until the dummy standing at `dummy` has less health than `health` (or has fallen, which is less still). */
  async waitForHealthBelow(dummy: Point, health: number): Promise<void> {
    try {
      await this.dummies.waitForHealthBelow(dummy, health);
    } catch (error) {
      throw new DslError(`Failed to see the dummy at ${dummy.x}, ${dummy.y} lose health`, error);
    }
  }

  /** Waits until no dummy stands at `dummy`. */
  async waitForGone(dummy: Point): Promise<void> {
    try {
      await this.dummies.waitForGone(dummy);
    } catch (error) {
      throw new DslError(`Failed to see the dummy at ${dummy.x}, ${dummy.y} fall`, error);
    }
  }
}
