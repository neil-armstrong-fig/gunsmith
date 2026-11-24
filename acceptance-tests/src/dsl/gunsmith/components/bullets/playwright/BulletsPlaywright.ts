import type {Page} from "@playwright/test";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {runHeldUntil} from "@src/dsl/gunsmith/playwright/hold/RunHeldUntil";
import {lookOfShot} from "@src/dsl/gunsmith/playwright/look/look-of-shot/LookOfShot";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {ShotLook} from "@src/dsl/gunsmith/types/ShotLook";

/** Where the in-page recorder keeps what it has seen. */
const SIGHTINGS_NAME = "gunsmithSpecSightings";

/** How far from its centre a shot's tail is past the body drawn over it: the body's radius, 0.4, and the bar's length, 0.58, to the tip. */
const CLEAR_OF_THE_OPPONENT_TILES = 1;

/** How far a held game runs between looks for the opponent's shot: a shot is in the air for 0.17 s or more, so a step this short cannot miss it. */
const FIRE_WATCH_STEP_SECONDS = 0.02;

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
        const sightings: Point[] = [];
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
    const handle = await this.page.waitForFunction<Point | false, string>(sightingsName => {
      const sightings: unknown = Reflect.get(window, sightingsName);
      if (!Array.isArray(sightings)) {
        return false;
      }

      return (sightings[0] as Point | undefined) ?? false;
    }, SIGHTINGS_NAME);

    const bullet = await handle.jsonValue();
    if (!bullet) {
      throw new Error("The wait for a bullet ended without one.");
    }

    return {x: bullet.x, y: bullet.y};
  }

  async waitForNoBullets(): Promise<void> {
    await this.waitForGameState(({bullets}) => bullets.length === 0);
  }

  async count(): Promise<number> {
    const {bullets} = await this.readGameState();

    return bullets.length;
  }

  /** Runs a held game (`holdTheGame`) in steps of `watch.stepSeconds` until no shot is in the air, and stops there. Throws if one still is after `watch.maxSeconds` of the game's time. */
  async runUntilNoneInTheAir(watch: HurtWatch): Promise<void> {
    await runHeldUntil(this.page, {
      watch,
      what: "The air clearing of shots",
      isDone: async () => (await this.count()) === 0,
    });
  }

  /** The shots in the air right now, with whose each is and which way it flies. */
  async getAll(): Promise<BulletSnapshot[]> {
    const {bullets} = await this.readGameState();

    return bullets;
  }

  /** How `bullet` looks on the screen: counted by colour along it, beside it, ahead of it and past its tail. The game must be held still. */
  async getLookOnScreen(bullet: BulletSnapshot): Promise<ShotLook> {
    return await lookOfShot(this.page, bullet);
  }

  /**
   * Runs a held game on in small steps until the opponent has a shot in the air that has flown clear of its body, which the opponent draws over (a shot starts half a tile out
   * and its bar is over half a tile long). The opponent fires on its own, and a shot at close range can be gone before it gets that far, so it waits for the next. Throws if there is
   * none after `maxSeconds` of the game's time.
   */
  async runUntilTheOpponentFires(maxSeconds: number): Promise<void> {
    for (let seconds = 0; seconds < maxSeconds; seconds += FIRE_WATCH_STEP_SECONDS) {
      await this.page.clock.runFor(Math.round(FIRE_WATCH_STEP_SECONDS * 1000));
      const {bullets, opponent} = await this.readGameState();
      if (
        opponent &&
        bullets.some(
          bullet =>
            bullet.shooter === "opponent" &&
            Math.hypot(bullet.x - opponent.x, bullet.y - opponent.y) >= CLEAR_OF_THE_OPPONENT_TILES,
        )
      ) {
        return;
      }
    }

    throw new Error(`The opponent did not have a shot clear of it in ${maxSeconds} seconds.`);
  }
}
