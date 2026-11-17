import type {Page} from "@playwright/test";
import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {DUMMY_GOLD} from "@src/dsl/gunsmith/playwright/look/DummyColours";
import {lookOfFighter} from "@src/dsl/gunsmith/playwright/look/look-of-fighter/LookOfFighter";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** How near a dummy's centre must be to a place to count as the dummy standing there, in tiles. */
const SAME_PLACE = 0.01;

export class DummiesPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getAll(): Promise<DummySnapshot[]> {
    const {dummies} = await this.readGameState();

    return dummies;
  }

  /** How much health the dummy standing at `place` has left, or `undefined` when no dummy stands there. */
  async getHealthAt(place: Point): Promise<number | undefined> {
    const {dummies} = await this.readGameState();

    return this.standingAt(dummies, place)?.health;
  }

  /** Whether the player sees the dummy standing at `place`, as the game itself reckons it. Throws when no dummy stands there. */
  async isSeenAt(place: Point): Promise<boolean> {
    const {dummies} = await this.readGameState();
    const standing = this.standingAt(dummies, place);
    if (!standing) {
      throw new Error(`No dummy stands at ${place.x}, ${place.y}.`);
    }

    return standing.visible;
  }

  /**
   * What a player sees where the dummy standing at `place` is drawn: its drawing counted by colour (`teamPixels` counts the gold of its ring and centre) and the
   * compass points on its outline. Nothing is drawn where a dummy is not seen.
   */
  async getLookOnScreen(place: Point): Promise<FighterLook> {
    return await lookOfFighter(this.page, place, DUMMY_GOLD);
  }

  /** Waits until the dummy standing at `dummy` has less health than `health`. A dummy that is gone has none. */
  async waitForHealthBelow(dummy: Point, health: number): Promise<void> {
    await this.waitForGameState(({dummies}) => {
      const standing = this.standingAt(dummies, dummy);

      return !standing || standing.health < health;
    });
  }

  /** Waits until no dummy stands at `dummy`. */
  async waitForGone(dummy: Point): Promise<void> {
    await this.waitForGameState(({dummies}) => !this.standingAt(dummies, dummy));
  }

  private standingAt(dummies: readonly DummySnapshot[], place: Point): DummySnapshot | undefined {
    return dummies.find(dummy => Math.hypot(dummy.x - place.x, dummy.y - place.y) < SAME_PLACE);
  }
}
