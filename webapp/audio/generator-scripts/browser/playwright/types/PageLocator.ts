/**
 * The part of a Playwright locator the check uses: a thing on the page to click or to read. Playwright answers `null` for a
 * thing with no text, and `verifyPage` turns that into an absence at once.
 */
export interface PageLocator {
  click: () => Promise<void>;
  textContent: () => Promise<string | null>;
}
