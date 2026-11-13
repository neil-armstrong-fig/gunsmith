import type {Page} from "@playwright/test";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {OpponentPlaywright} from "@src/dsl/gunsmith/components/opponent/playwright/OpponentPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The opponent in a duel, reached as `gunsmith.opponent`. */
export class OpponentDsl {
  private readonly opponent: OpponentPlaywright;

  constructor(page: Page) {
    this.opponent = new OpponentPlaywright(page);
  }

  /** Where the opponent stands in tiles, its health, the rounds in its magazine and what it is doing (absent when it takes no action). */
  async get(): Promise<OpponentSnapshot> {
    try {
      return await this.opponent.get();
    } catch (error) {
      throw new DslError("Failed to read the opponent", error);
    }
  }

  /** Waits until the opponent has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    try {
      await this.opponent.waitForHealthBelow(health);
    } catch (error) {
      throw new DslError(`Failed to see the opponent drop below ${health} health`, error);
    }
  }

  /** Waits until the opponent is doing `behaviour` (`wander`, `engage`, `reload` or `search`), for as long as `timeoutSeconds` when that is longer than the default. */
  async waitForBehaviour(behaviour: string, timeoutSeconds?: number): Promise<void> {
    try {
      await this.opponent.waitForBehaviour(behaviour, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to see the opponent start to ${behaviour}`, error);
    }
  }

  /** Waits until the opponent is doing something else than `behaviour`. */
  async waitForBehaviourOtherThan(behaviour: string, timeoutSeconds?: number): Promise<void> {
    try {
      await this.opponent.waitForBehaviourOtherThan(behaviour, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to see the opponent stop doing "${behaviour}"`, error);
    }
  }

  /** Waits until the opponent has at least `rounds` rounds in the magazine of the weapon it holds. */
  async waitForRoundsAtLeast(rounds: number, timeoutSeconds?: number): Promise<void> {
    try {
      await this.opponent.waitForRoundsAtLeast(rounds, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to see the opponent's magazine back up to ${rounds} rounds`, error);
    }
  }

  /** Waits until the opponent has fewer than `rounds` rounds in the magazine of the weapon it holds. */
  async waitForRoundsBelow(rounds: number): Promise<void> {
    try {
      await this.opponent.waitForRoundsBelow(rounds);
    } catch (error) {
      throw new DslError(`Failed to see the opponent's magazine drop below ${rounds} rounds`, error);
    }
  }

  /** Waits until the opponent stands at least `tiles` away from `spot`. */
  async waitToBeAwayFrom(spot: Point, tiles: number): Promise<void> {
    try {
      await this.opponent.waitToBeAwayFrom(spot, tiles);
    } catch (error) {
      throw new DslError(`Failed to see the opponent move ${tiles} tiles away from where it began`, error);
    }
  }
}
