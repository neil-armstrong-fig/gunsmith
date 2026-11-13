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

  /** Whether the round is still being fought, or has been won or lost. */
  async getState(): Promise<RoundSnapshot> {
    try {
      return await this.round.getState();
    } catch (error) {
      throw new DslError("Failed to read the state of the round", error);
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

  /** Presses the banner's "Play again" button. */
  async playAgain(): Promise<void> {
    try {
      await this.round.playAgain();
    } catch (error) {
      throw new DslError("Failed to press Play again", error);
    }
  }
}
