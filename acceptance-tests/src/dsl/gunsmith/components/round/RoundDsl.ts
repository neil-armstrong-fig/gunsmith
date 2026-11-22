import type {Page} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {RoundPlaywright} from "@src/dsl/gunsmith/components/round/playwright/RoundPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The round being fought, and the banner that announces how it ended, reached as `gunsmith.round`. */
export class RoundDsl {
  private readonly round: RoundPlaywright;

  constructor(page: Page) {
    this.round = new RoundPlaywright(page);
  }

  async backToMainMenu(): Promise<void> {
    try {
      await this.round.backToMainMenu();
    } catch (error) {
      throw new DslError("Could not go to the main menu from the round banner", error);
    }
  }

  /** Whether the round is still being fought, or has been won, lost or drawn. */
  async getState(): Promise<RoundSnapshot> {
    try {
      return await this.round.getState();
    } catch (error) {
      throw new DslError("Failed to read the state of the round", error);
    }
  }

  /** How many seconds of game time the round has been fought: it starts again from zero with each round. */
  async getElapsedSeconds(): Promise<number> {
    try {
      return await this.round.getElapsedSeconds();
    } catch (error) {
      throw new DslError("Failed to read how long the round has been fought", error);
    }
  }

  /** Waits until the round stands at `state`, for as long as `timeoutSeconds` when a round is known to take longer than the default. */
  async waitForState(state: RoundSnapshot, timeoutSeconds?: number): Promise<void> {
    try {
      await this.round.waitForState(state, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to see the round reach "${state}"`, error);
    }
  }

  /** The words the banner over the arena shows, once it has appeared. */
  async getBannerMessage(): Promise<string> {
    try {
      return await this.round.getBannerMessage();
    } catch (error) {
      throw new DslError("Failed to read the round banner", error);
    }
  }

  /** Whether the banner is on the screen right now. */
  async isBannerShown(): Promise<boolean> {
    try {
      return await this.round.isBannerShown();
    } catch (error) {
      throw new DslError("Failed to see whether the round banner is shown", error);
    }
  }

  /** Waits until the banner is no longer on the screen. */
  async waitForBannerToGo(): Promise<void> {
    try {
      await this.round.waitForBannerToGo();
    } catch (error) {
      throw new DslError("Failed to see the round banner go", error);
    }
  }

  /** The score line on the banner, such as "You 0 · Opponent 1". */
  async getBannerScore(): Promise<string> {
    try {
      return await this.round.getBannerScore();
    } catch (error) {
      throw new DslError("Failed to read the score on the round banner", error);
    }
  }

  /** Whether the banner offers a "Next round" button right now. */
  async isNextRoundOffered(): Promise<boolean> {
    try {
      return await this.round.isNextRoundOffered();
    } catch (error) {
      throw new DslError("Failed to see whether the next round is offered", error);
    }
  }

  /** Whether the banner offers a "Play again" button right now. */
  async isPlayAgainOffered(): Promise<boolean> {
    try {
      return await this.round.isPlayAgainOffered();
    } catch (error) {
      throw new DslError("Failed to see whether playing again is offered", error);
    }
  }

  /** Whether the banner says this player is waiting for the other player to ask for the next round too (online rooms). */
  async isWaitingForTheOtherPlayer(): Promise<boolean> {
    try {
      return await this.round.isWaitingForTheOtherPlayer();
    } catch (error) {
      throw new DslError("Failed to see whether the banner is waiting for the other player", error);
    }
  }

  /** Presses the banner's "Next round" button. */
  async nextRound(): Promise<void> {
    try {
      await this.round.nextRound();
    } catch (error) {
      throw new DslError("Failed to press Next round", error);
    }
  }

  /** Presses the banner's "Play again" button. */
  async playAgain(): Promise<void> {
    try {
      await this.round.playAgain();
    } catch (error) {
      throw new DslError("Failed to press Play again", error);
    }
  }
}
