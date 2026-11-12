import type {Page} from "@playwright/test";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** Where the in-page recorder keeps what it has seen. */
const SIGHTINGS_NAME = "gunsmithSpecSightings";

export class BulletsPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Starts watching for bullets from the moment the page loads: on every frame a small recorder in the page notes each
   * bullet that has just appeared. A bullet is in the air for a fraction of a second, so asking after the click would be a
   * race that a slow machine loses; the recorder is test-side only and reads nothing but the state hook.
   */
  async startWatching(): Promise<void> {
    await this.page.addInitScript(
      ({hookName, sightingsName}) => {
        const sightings: BulletSnapshot[] = [];
        Reflect.set(window, sightingsName, sightings);
        let inTheAir = 0;

        const look = (): void => {
          const read: unknown = Reflect.get(window, hookName);
          if (typeof read === "function") {
            const {bullets} = read() as GameStateSnapshot;
            const newest = bullets[bullets.length - 1];
            if (newest && bullets.length > inTheAir) {
              sightings.push({x: newest.x, y: newest.y});
            }

            inTheAir = bullets.length;
          }

          requestAnimationFrame(look);
        };

        requestAnimationFrame(look);
      },
      {hookName: STATE_HOOK_NAME, sightingsName: SIGHTINGS_NAME},
    );
  }

  /** Waits until the recorder has seen a bullet, and returns where the first one was when it was first seen. */
  async waitForABullet(): Promise<Point> {
    const handle = await this.page.waitForFunction<BulletSnapshot | false, string>(sightingsName => {
      const sightings: unknown = Reflect.get(window, sightingsName);
      if (!Array.isArray(sightings)) {
        return false;
      }

      return (sightings[0] as BulletSnapshot | undefined) ?? false;
    }, SIGHTINGS_NAME);

    const bullet = await handle.jsonValue();
    if (!bullet) {
      throw new Error("The wait for a bullet ended without one.");
    }

    return {x: bullet.x, y: bullet.y};
  }

  async waitForNoBullets(): Promise<void> {
    await this.page.waitForFunction<boolean, string>(hookName => {
      const read: unknown = Reflect.get(window, hookName);
      if (typeof read !== "function") {
        return false;
      }

      return (read() as GameStateSnapshot).bullets.length === 0;
    }, STATE_HOOK_NAME);
  }

  async count(): Promise<number> {
    const {bullets} = await readGameState(this.page);

    return bullets.length;
  }
}
