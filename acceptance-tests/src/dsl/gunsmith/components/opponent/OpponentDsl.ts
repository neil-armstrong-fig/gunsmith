import type {Page} from "@playwright/test";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {OpponentPlaywright} from "@src/dsl/gunsmith/components/opponent/playwright/OpponentPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The scripted opponent in a duel, reached as `gunsmith.opponent`. */
export class OpponentDsl {
  private readonly opponent: OpponentPlaywright;

  constructor(page: Page) {
    this.opponent = new OpponentPlaywright(page);
  }

  /** Where the opponent stands in tiles and how much health it has left. */
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
}
