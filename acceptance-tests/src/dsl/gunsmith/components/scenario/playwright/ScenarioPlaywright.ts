import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {ClosingRingRequest} from "@src/dsl/gunsmith/components/scenario/types/ClosingRingRequest";
import type {PickupDrawing} from "@src/dsl/gunsmith/components/scenario/types/PickupDrawing";
import type {PickupDrawingRequest} from "@src/dsl/gunsmith/components/scenario/types/PickupDrawingRequest";
import type {TerrainPictures} from "@src/dsl/gunsmith/components/scenario/types/TerrainPictures";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/**
 * Art's pictures, served from `public/assets/sprites`. Only the `.svg` files: the dev server also serves the app's own code from a
 * `src/assets/sprites` folder, and a glob of everything under `assets/sprites` 404'd that code too and left a blank page.
 */
const PICTURES = "**/assets/sprites/*.svg";

/** What each pickup drawing adds to the page's address: the built-in SMG asks for no drawing, so it keeps its own. */
const PICKUP_DRAWING_QUERIES: Record<PickupDrawing, string> = {
  lantern: "&weaponDrawing=lantern",
  cactus: "&weaponDrawing=cactus",
  refused: "&weaponDrawing=refused",
  "built-in SMG": "",
};

export class ScenarioPlaywright extends BasePage {
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

  /** Opens the practice range with `seed` in its address, which a bot game started from its menu keeps. */
  async openPracticeRange(seed: number): Promise<void> {
    await this.page.goto(`/?menu=0&seed=${seed}`);
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

  /** Opens sparring with `seed`, the weapon lying in the arena drawn as the named drawing (`?weaponDrawing=`, a seam for the specs and for looking at a drawing), or as its own. */
  async openSparringWithPickupDrawing(request: PickupDrawingRequest): Promise<void> {
    await this.openScenario(`sparring&seed=${request.seed}${PICKUP_DRAWING_QUERIES[request.drawing]}`);
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

  /** The ring's part of the query: its timings, and its damage when the request boosts it. */
  private ringQuery(request: ClosingRingRequest): string {
    const timings = `&ringDelay=${request.delaySeconds}&ringClosing=${request.closingSeconds}`;
    if (request.damageScale === undefined) {
      return timings;
    }

    return `${timings}&ringDamage=${request.damageScale}`;
  }
}
