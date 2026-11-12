import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import type {GameStateCheck} from "@src/dsl/gunsmith/playwright/types/GameStateCheck";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";

/** How long `waitForGameState` waits before looking again, in milliseconds: soon at first, settling at the last. */
const LOOK_AGAIN_AFTER = [25, 50, 100];

/** A whole screen. Put helpers wanted on every page here. */
export abstract class BasePage {
  protected constructor(protected page: Page) {}

  /** How the game stands right now, read through its one read-only state hook. */
  protected async readGameState(): Promise<GameStateSnapshot> {
    return await readGameState(this.page);
  }

  /**
   * Waits until `check` says yes of the game as it stands, looking again as long as it says no (until the expect
   * timeout). The check runs here in the test, not in the page, so it may use anything in scope; a state that comes and
   * goes between two looks is not for this (`BulletsPlaywright` records those from inside the page instead).
   */
  protected async waitForGameState(check: GameStateCheck): Promise<void> {
    await expect.poll(async () => check(await this.readGameState()), {intervals: LOOK_AGAIN_AFTER}).toBe(true);
  }
}
