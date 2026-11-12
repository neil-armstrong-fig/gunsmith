import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";
import type {Size} from "@src/dsl/gunsmith/types/Size";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";

export class GunsmithPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-ready", "true");
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
    const {elapsedSeconds} = await readGameState(this.page);

    await this.page.waitForFunction(
      ([hookName, until]) => {
        const read: unknown = Reflect.get(window, String(hookName));
        if (typeof read !== "function") {
          return false;
        }

        return (read() as GameStateSnapshot).elapsedSeconds >= Number(until);
      },
      [STATE_HOOK_NAME, elapsedSeconds + seconds],
    );
  }
}
