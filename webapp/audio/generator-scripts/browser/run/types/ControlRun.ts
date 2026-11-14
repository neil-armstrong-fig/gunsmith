import type {LaunchedBrowser} from "@gunsmith/audio-studies/browser/playwright/types/LaunchedBrowser";
import type {PlaywrightTools} from "@gunsmith/audio-studies/browser/playwright/types/PlaywrightTools";

/** A control to run: the browser to open a page in, the address of the check and the assertion to wait with. */
export interface ControlRun {
  browser: LaunchedBrowser;
  address: string;
  expect: PlaywrightTools["expect"];
}
