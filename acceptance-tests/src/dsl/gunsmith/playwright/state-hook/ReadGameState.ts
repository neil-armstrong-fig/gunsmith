import type {Page} from "@playwright/test";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";

/** Asks the game, through its one read-only hook, how things stand right now. */
export async function readGameState(page: Page): Promise<GameStateSnapshot> {
  const state = await page.evaluate<GameStateSnapshot | undefined, string>(hookName => {
    const read: unknown = Reflect.get(window, hookName);
    if (typeof read !== "function") {
      return undefined;
    }

    return read() as GameStateSnapshot;
  }, STATE_HOOK_NAME);

  if (!state) {
    throw new Error(`The game has not put its state hook (window.${STATE_HOOK_NAME}) on the page.`);
  }

  return state;
}
