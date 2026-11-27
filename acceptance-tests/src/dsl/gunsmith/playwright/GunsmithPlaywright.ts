import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {ClosingRingRequest} from "@src/dsl/gunsmith/types/ClosingRingRequest";
import type {PickupDrawingRequest} from "@src/dsl/gunsmith/types/PickupDrawingRequest";
import type {TerrainPictures} from "@src/dsl/gunsmith/types/TerrainPictures";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** Art's pictures, served from `public/assets/sprites`. Only the `.svg` files: the dev server also serves the app's own code from a `src/assets/sprites` folder. */
const PICTURES = "**/assets/sprites/*.svg";

/**
 * A held game stops this long after it is asked to. It must be longer than the page can take between reading the time and pausing it, or Playwright refuses to pause "in the past":
 * a machine running other work (several sessions share this one) has taken more than a second. The game runs on, as fast as it can, up to that point.
 */
const HOLD_AFTER_MILLISECONDS = 3000;

export class GunsmithPlaywright extends BasePage {
  /** Lets through pictures a scenario is holding back. */
  private releaseHeldPictures: (() => void) | undefined;

  /** What the spec has asked of the page beyond the scenario (`shake=0`, `fog=off`, `reducedMotion=1`), added to the address of whatever it opens next. */
  private readonly askedFor: string[] = [];

  constructor(page: Page) {
    super(page);
  }

  /** Has the next scenario opened with a camera that does not shake. */
  keepTheCameraStill(): void {
    this.askedFor.push("shake=0");
  }

  /** Has the next scenario opened with the fog's veil left out. */
  hideTheFog(): void {
    this.askedFor.push("fog=off");
  }

  /** Has the next scenario opened asking for reduced motion. */
  askForReducedMotion(): void {
    this.askedFor.push("reducedMotion=1");
  }

  async preferReducedMotion(): Promise<void> {
    await this.page.emulateMedia({reducedMotion: "reduce"});
  }

  async open(): Promise<void> {
    await this.page.goto("/?menu=0");
    await this.waitForArena();
  }

  /** Loads the page again, as a player's reload does, and waits for the arena. What the browser stores stays; what the page holds in memory does not. */
  async reloadThePage(): Promise<void> {
    await this.page.reload();
    await this.waitForArena();
  }

  /** Opens the duel with the opponent's every choice drawn from `seed`, so the same seed plays the same match. */
  async openDuel(seed: number): Promise<void> {
    await this.openScenario(`duel&seed=${seed}`);
  }

  /** Opens the duel behind its pre-round (`?preRound=1`), as the practice range's "Start bot game" does. */
  async openDuelWithPreRound(seed: number): Promise<void> {
    await this.openScenario(`duel&seed=${seed}&preRound=1`);
  }

  async openSparring(): Promise<void> {
    await this.openScenario("sparring");
  }

  /**
   * Opens sparring with every picture art made held back on its way to the page, as a slow connection would, until `releasePictures`. Nothing waits on a clock:
   * the pictures arrive when the spec says, so it can look at the page while they have not. Returns once the canvas is up, which is before the pictures are.
   */
  async openSparringWithHeldPictures(): Promise<void> {
    await this.openWithHeldPictures("sparring", PICTURES);
  }

  /** Lets the pictures held back by `openSparringWithHeldPictures` through, and waits until the page has them. */
  async releasePictures(): Promise<void> {
    if (!this.releaseHeldPictures) {
      throw new Error("No pictures are being held back.");
    }

    this.releaseHeldPictures();
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-sprites-ready", "true");
  }

  /** Opens sparring with art's pictures missing from the server, as a bad deploy would leave them. */
  async openSparringWithMissingPictures(seed?: number): Promise<void> {
    await this.page.route(PICTURES, async route => {
      await route.fulfill({status: 404});
    });

    if (seed !== undefined) {
      await this.openSparringWithSeed(seed);
      return;
    }

    await this.openSparring();
  }

  async openSparringWithMissingRifle(): Promise<void> {
    await this.page.route("**/assets/sprites/sprite-rifle-default.svg", async route => {
      await route.fulfill({status: 404});
    });

    await this.openSparring();
  }

  /** Opens sparring with everything the game draws (a ring's centre, a pickup's place) drawn from `seed`, so the same seed plays the same match. */
  async openSparringWithSeed(seed: number): Promise<void> {
    await this.openScenario(`sparring&seed=${seed}`);
  }

  /** Opens sparring with `seed`, the weapon lying in the arena drawn as the named drawing (`?weaponDrawing=`, a seam for the specs and for looking at a drawing). */
  async openSparringWithPickupDrawing(request: PickupDrawingRequest): Promise<void> {
    await this.openScenario(`sparring&seed=${request.seed}&weaponDrawing=${request.drawing}`);
  }

  /** Opens sparring with a ring of its own: it starts after `delaySeconds`, closes over `closingSeconds`, and its centre is drawn from `seed`. */
  async openClosingRing(request: ClosingRingRequest): Promise<void> {
    await this.openScenario(`sparring&seed=${request.seed}${this.ringQuery(request)}`);
  }

  /** Opens the duel with a ring of its own: it starts after `delaySeconds`, closes over `closingSeconds`, and its centre and the opponent's choices are drawn from `seed`. */
  async openClosingDuel(request: ClosingRingRequest): Promise<void> {
    await this.openScenario(`duel&seed=${request.seed}${this.ringQuery(request)}`);
  }

  /** Opens the duel on the terraced arena (one round, two levels) with a ring of its own: its centre and the opponent's choices are drawn from `seed`. */
  async openTerracedDuel(request: ClosingRingRequest): Promise<void> {
    await this.openScenario(`terraced&seed=${request.seed}${this.ringQuery(request)}`);
  }

  /** Opens the overlook (the terraced arena, the opponent on the platform and the player below it, one round, no ring), its choices drawn from `seed`. */
  async openOverlookDuel(seed: number): Promise<void> {
    await this.openScenario(`overlook&seed=${seed}`);
  }

  /** Opens the overwatch (a corridor one tile wide, the opponent on its low ground and the player on the platform at its end, farther than the opponent sees, one round, no ring), its choices drawn from `seed`. */
  async openOverwatch(seed: number): Promise<void> {
    await this.openScenario(`overwatch&seed=${seed}`);
  }

  /** Opens the cover hall (a hall ten tiles long with a low cover block at its third and eighth tile, the player and the opponent each in the two-tile pocket behind theirs, one round, no ring), the opponent's choices drawn from `seed`. */
  async openCoverHall(seed: number): Promise<void> {
    await this.openScenario(`cover-hall&seed=${seed}`);
  }

  /** Opens the cover run (open low ground with one low cover block, the opponent with an empty magazine two tiles past it, eight tiles east of the player, one round, no ring), the opponent's choices drawn from `seed`. */
  async openCoverRun(seed: number): Promise<void> {
    await this.openScenario(`cover-run&seed=${seed}`);
  }

  /** Opens the mutual knockout (the duel's first round with a shot in the air from each fighter at the other, so both fall in the first step). */
  async openMutualKnockout(): Promise<void> {
    await this.openScenario("mutual-knockout");
  }

  /** Opens the pickup race (the duel's arena and fighters, one round, no ring, a weapon lying much nearer the opponent than the player), its choices drawn from `seed`. */
  async openPickupRace(seed: number): Promise<void> {
    await this.openScenario(`pickup-race&seed=${seed}`);
  }

  /** Opens the fair duel (fixture A: a shared platform in the middle, the fighters at a matching pair of places, one round, a ring), the pair and the opponent's choices drawn from `seed`. */
  async openFairDuel(seed: number): Promise<void> {
    await this.openScenario(`fair-duel&seed=${seed}`);
  }

  async openHeights(): Promise<void> {
    await this.openScenario("heights");
  }

  async openCover(): Promise<void> {
    await this.openScenario("cover");
  }

  async openTerrain(pictures?: TerrainPictures): Promise<void> {
    const highestFloor = "**/assets/tiles/tile-floor-l3.svg";

    if (pictures === "held") {
      await this.openWithHeldPictures("terrain", highestFloor);
      return;
    }

    if (pictures === "missing") {
      await this.page.route(highestFloor, async route => {
        await route.fulfill({status: 404});
      });
    }

    await this.openScenario("terrain");
  }

  /**
   * Holds the game still: nothing in the page moves, however much real time passes, until `runGameFor` lets it. A shot is in the air for a fraction of a second,
   * so a spec that wants to look at one holds the game on it. Call it once the game is open.
   */
  async holdTheGame(): Promise<void> {
    await this.page.clock.install();
    const now = await this.page.evaluate(() => Date.now());
    await this.page.clock.pauseAt(now + HOLD_AFTER_MILLISECONDS);
  }

  /** Lets a held game run for `seconds` of its own time, as fast as the machine can, and holds it again. */
  async runGameFor(seconds: number): Promise<void> {
    await this.page.clock.runFor(Math.round(seconds * 1000));
  }

  async resizeWindowTo(size: Size): Promise<void> {
    await this.page.setViewportSize(size);
  }

  getWindowSize(): Size {
    const size = this.page.viewportSize();
    if (!size) {
      throw new Error("The browser has no viewport to measure.");
    }

    return size;
  }

  /** Waits until the game's own clock has run `seconds` further, however long that takes on the wall clock. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    const {elapsedSeconds} = await this.readGameState();

    await this.waitForGameState(state => state.elapsedSeconds >= elapsedSeconds + seconds);
  }

  private async openWithHeldPictures(scenario: string, pictures: string): Promise<void> {
    const released = new Promise<void>(resolve => {
      this.releaseHeldPictures = resolve;
    });
    await this.page.route(pictures, async route => {
      await released;
      await route.continue();
    });

    await this.page.goto(`/?menu=0&scenario=${scenario}`);
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }

  private async openScenario(scenario: string): Promise<void> {
    const asked = this.askedFor.map(request => `&${request}`).join("");

    await this.page.goto(`/?menu=0&scenario=${scenario}${asked}`);
    await this.waitForArena();
  }

  /**
   * Waits until the canvas has been sized and drawn into (`data-ready`), and until every picture the scene draws has loaded or been
   * given up on (`data-sprites-ready`): the pictures decode after the page opens, and until they do a placeholder shows in their place.
   */
  private async waitForArena(): Promise<void> {
    const arena = this.page.getByTestId("arena");

    await expect(arena).toHaveAttribute("data-ready", "true");
    await expect(arena).toHaveAttribute("data-sprites-ready", "true");
  }

  /** The ring's part of the query: its timings, and its damage when the request boosts it. */
  private ringQuery(request: ClosingRingRequest): string {
    const timings = `&ringDelay=${request.delaySeconds}&ringClosing=${request.closingSeconds}`;
    if (request.damageScale === undefined) {
      return timings;
    }

    return `${timings}&ringDamage=${request.damageScale}`;
  }
}
