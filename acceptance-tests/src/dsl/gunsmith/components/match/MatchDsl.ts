import type {Page} from "@playwright/test";
import type {MatchSnapshot} from "@gunsmith/shared/state-hook/types/MatchSnapshot";
import {MatchPlaywright} from "@src/dsl/gunsmith/components/match/playwright/MatchPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The best-of-three a duel is, reached as `gunsmith.match`. */
export class MatchDsl {
  private readonly match: MatchPlaywright;

  constructor(page: Page) {
    this.match = new MatchPlaywright(page);
  }

  /** The rounds each side has won and which round is being fought, as the game itself keeps them. */
  async getScore(): Promise<MatchSnapshot> {
    try {
      return await this.match.getScore();
    } catch (error) {
      throw new DslError("Failed to read the score of the match", error);
    }
  }

  /** The words the score readout over the arena shows. */
  async getScoreOnScreen(): Promise<string> {
    try {
      return await this.match.getScoreOnScreen();
    } catch (error) {
      throw new DslError("Failed to read the score on the screen", error);
    }
  }
}
