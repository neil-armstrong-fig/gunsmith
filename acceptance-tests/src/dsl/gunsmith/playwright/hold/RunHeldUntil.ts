import type {Page} from "@playwright/test";
import type {HeldRun} from "@src/dsl/gunsmith/playwright/hold/types/HeldRun";

/**
 * Runs a held game (`holdTheGame`) in steps of `watch.stepSeconds` until `isDone` says so, and stops there, so a spec can look at the moment it means.
 * Throws if it has not happened after `watch.maxSeconds` of the game's time, saying `what` did not.
 */
export async function runHeldUntil(page: Page, {watch, what, isDone}: HeldRun): Promise<void> {
  for (let seconds = 0; seconds < watch.maxSeconds; seconds += watch.stepSeconds) {
    await page.clock.runFor(Math.round(watch.stepSeconds * 1000));
    if (await isDone()) {
      return;
    }
  }

  throw new Error(`${what} did not happen in ${watch.maxSeconds} seconds.`);
}
