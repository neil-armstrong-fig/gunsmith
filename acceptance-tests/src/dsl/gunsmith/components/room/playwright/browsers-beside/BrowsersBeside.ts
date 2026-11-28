import type {BrowserContext, Page} from "@playwright/test";
import {enterRoom} from "@src/dsl/gunsmith/components/room/playwright/enter-room/EnterRoom";

/** A browser opened beside this one, with a session of its own. */
interface NewBrowser {
  context: BrowserContext;
  page: Page;
}

/** The browsers a room spec opens beside the first, each in a context of its own: the second player's and a stranger's. */
export class BrowsersBeside {
  /** The context of the second browser: its own storage and its own session, never a second page of this one. */
  private secondContext: BrowserContext | undefined;

  /** The context of a stranger's browser, which has no seat of its own and tries to take one. */
  private strangerContext: BrowserContext | undefined;

  /** The site's address, kept from when the room was opened: after this browser leaves, its page has none to give. */
  private origin = "";

  constructor(private readonly page: Page) {}

  /** Keeps the site's address the first browser is on, for the browsers opened beside it. */
  rememberOrigin(): void {
    this.origin = new URL(this.page.url()).origin;
  }

  /**
   * Opens a second browser, in a context of its own, and takes it into the room `code` names. `beforeOpening` is handed its
   * page first, so a recorder can be attached before anything is sent to it.
   */
  async openSecond(code: string, beforeOpening: (secondPage: Page) => Promise<void>): Promise<void> {
    this.secondContext = await this.openBrowserBeside(code, beforeOpening);
  }

  /** Opens a second browser, in a context of its own, with this browser's origin, and leaves it where it is. `beforeOpening` is handed its page first. */
  async openSecondBeside(beforeOpening: (secondPage: Page) => void): Promise<void> {
    this.rememberOrigin();
    const {context, page} = await this.newBrowserBeside();
    this.secondContext = context;
    beforeOpening(page);
  }

  /**
   * Opens a browser with no seat in the room `code` names, as a stranger who has the friend code would, and waits until the server has
   * turned its connection away: the room is full, so the page never has an arena to wait for.
   */
  async openStranger(code: string, beforeOpening: (strangerPage: Page) => void): Promise<void> {
    const {context, page} = await this.newBrowserBeside();
    this.strangerContext = context;
    beforeOpening(page);

    const connecting = page.waitForEvent("websocket");
    await page.goto(`/?room=${encodeURIComponent(code)}`);
    const socket = await connecting;
    await socket.waitForEvent("close");
  }

  async closeAll(): Promise<void> {
    await this.secondContext?.close();
    this.secondContext = undefined;
    await this.strangerContext?.close();
    this.strangerContext = undefined;
  }

  private async openBrowserBeside(code: string, beforeOpening: (page: Page) => Promise<void>): Promise<BrowserContext> {
    const {context, page} = await this.newBrowserBeside();
    await beforeOpening(page);
    await enterRoom(page, code);

    return context;
  }

  private async newBrowserBeside(): Promise<NewBrowser> {
    const browser = this.page.context().browser();
    if (!browser) {
      throw new Error("This page has no browser to open another one beside.");
    }

    const context = await browser.newContext({baseURL: this.origin});

    return {context, page: await context.newPage()};
  }
}
