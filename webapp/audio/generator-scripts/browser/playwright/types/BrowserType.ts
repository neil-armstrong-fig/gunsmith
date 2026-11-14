import type {LaunchedBrowser} from "@gunsmith/audio-studies/browser/playwright/types/LaunchedBrowser";

/** A kind of browser Playwright can start, as `chromium` or `webkit`. */
export interface BrowserType {
  name: () => string;
  launch: () => Promise<LaunchedBrowser>;
}
