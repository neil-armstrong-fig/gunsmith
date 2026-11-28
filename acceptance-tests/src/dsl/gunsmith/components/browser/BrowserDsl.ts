import type {Page} from "@playwright/test";
import {BrowserPlaywright} from "@src/dsl/gunsmith/components/browser/playwright/BrowserPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** The browser the game runs in, reached as `gunsmith.browser`: its window, its reload and what it tells the page the person prefers. */
export class BrowserDsl {
  private readonly browser: BrowserPlaywright;

  constructor(page: Page) {
    this.browser = new BrowserPlaywright(page);
  }

  /** Has the browser say the person prefers reduced motion (`prefers-reduced-motion: reduce`), as their system setting would, before the spec opens the game. */
  async preferReducedMotion(): Promise<void> {
    try {
      await this.browser.preferReducedMotion();
    } catch (error) {
      throw new DslError("Failed to have the browser prefer reduced motion", error);
    }
  }

  /** Reloads the page, as a player does, and waits until the arena is on screen: whatever the browser keeps (the shelf) stays and the rest starts again. */
  async reloadThePage(): Promise<void> {
    try {
      await this.browser.reloadThePage();
    } catch (error) {
      throw new DslError("Failed to reload the page", error);
    }
  }

  async resizeWindowTo(size: Size): Promise<void> {
    try {
      await this.browser.resizeWindowTo(size);
    } catch (error) {
      throw new DslError(`Failed to resize the window to ${size.width} by ${size.height}`, error);
    }
  }

  /** How big the browser window is, in pixels. */
  getWindowSize(): Size {
    try {
      return this.browser.getWindowSize();
    } catch (error) {
      throw new DslError("Failed to read how big the window is", error);
    }
  }
}
