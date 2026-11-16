import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {ClosingRingRequest} from "@src/dsl/gunsmith/types/ClosingRingRequest";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class GunsmithPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
  }

  /** Opens the duel with the opponent's every choice drawn from `seed`, so the same seed plays the same match. */
  async openDuel(seed: number): Promise<void> {
    await this.openScenario(`duel&seed=${seed}`);
  }

  async openSparring(): Promise<void> {
    await this.openScenario("sparring");
  }

  /** Opens sparring with everything the game draws (a ring's centre, a pickup's place) drawn from `seed`, so the same seed plays the same match. */
  async openSparringWithSeed(seed: number): Promise<void> {
    await this.openScenario(`sparring&seed=${seed}`);
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

  async openHeights(): Promise<void> {
    await this.openScenario("heights");
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

  private async openScenario(scenario: string): Promise<void> {
    await this.page.goto(`/?scenario=${scenario}`);
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
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
