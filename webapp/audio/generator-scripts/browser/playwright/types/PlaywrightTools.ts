import type {AttributeAssertion} from "@gunsmith/audio-studies/browser/playwright/types/AttributeAssertion";
import type {BrowserType} from "@gunsmith/audio-studies/browser/playwright/types/BrowserType";
import type {PageLocator} from "@gunsmith/audio-studies/browser/playwright/types/PageLocator";

/** What the check takes from Playwright: the two browsers to run, and the assertion that waits for a page to settle. */
export interface PlaywrightTools {
  chromium: BrowserType;
  webkit: BrowserType;
  expect: (locator: PageLocator) => AttributeAssertion;
}
