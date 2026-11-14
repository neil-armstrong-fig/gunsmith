import {createRequire} from "node:module";
import type {PlaywrightTools} from "@gunsmith/audio-studies/browser/playwright/types/PlaywrightTools";

/**
 * Playwright, borrowed from the acceptance workspace, which already installs it and its browsers. This package adds no
 * dependency for it, the game never imports it, and a browser check is the only thing here that needs it.
 */
export function loadPlaywright(): PlaywrightTools {
  const acceptanceRequire = createRequire(new URL("../../../../../acceptance-tests/package.json", import.meta.url));

  return acceptanceRequire("@playwright/test") as PlaywrightTools;
}
