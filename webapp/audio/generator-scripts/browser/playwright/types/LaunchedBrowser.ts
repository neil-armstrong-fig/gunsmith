import type {BrowserPage} from "@gunsmith/audio-studies/browser/playwright/types/BrowserPage";

/** A browser that is running: Chromium or WebKit. */
export interface LaunchedBrowser {
  version: () => string;
  newPage: () => Promise<BrowserPage>;
  close: () => Promise<void>;
}
