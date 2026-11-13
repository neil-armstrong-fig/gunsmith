import type {Page} from "@playwright/test";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Point} from "@src/dsl/gunsmith/types/Point";

export class OpponentPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Where the opponent stands and how much health it has left. Throws when the game has no opponent. */
  async get(): Promise<OpponentSnapshot> {
    const {opponent} = await this.readGameState();
    if (!opponent) {
      throw new Error("The game has no opponent in it.");
    }

    return opponent;
  }

  /** Waits until the opponent has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.health < health);
  }

  /**
   * Waits until the opponent's behaviour is `behaviour` (`wander`, `engage`, `reload` or `search`), for as long as the
   * expect timeout or `timeoutSeconds` allows.
   */
  async waitForBehaviour(behaviour: string, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent?.behaviour === behaviour, timeoutSeconds);
  }

  /** Waits until the opponent is doing something else than `behaviour` (it must have a brain). */
  async waitForBehaviourOtherThan(behaviour: string, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(
      ({opponent}) => opponent?.behaviour !== undefined && opponent.behaviour !== behaviour,
      timeoutSeconds,
    );
  }

  /** Waits until the opponent has fewer than `rounds` in the magazine of the weapon it holds. */
  async waitForRoundsBelow(rounds: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.rounds < rounds);
  }

  /** Waits until the opponent has at least `rounds` in the magazine of the weapon it holds. */
  async waitForRoundsAtLeast(rounds: number, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.rounds >= rounds, timeoutSeconds);
  }

  /** Waits until the opponent stands at least `tiles` from `spot`. */
  async waitToBeAwayFrom(spot: Point, tiles: number): Promise<void> {
    await this.waitForGameState(
      ({opponent}) => opponent !== undefined && Math.hypot(opponent.x - spot.x, opponent.y - spot.y) >= tiles,
    );
  }
}
