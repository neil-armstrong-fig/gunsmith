import type {BrowserPage} from "@gunsmith/audio-studies/browser/playwright/types/BrowserPage";
import type {PlaywrightTools} from "@gunsmith/audio-studies/browser/playwright/types/PlaywrightTools";

/** One go at the page: the page to use, the address of the check, the assertion to wait with and how long to wait. */
export interface PageRun {
  page: BrowserPage;
  address: string;
  expect: PlaywrightTools["expect"];
  timeoutMs: number;
}
