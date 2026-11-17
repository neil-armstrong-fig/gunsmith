import type {BrowserContext, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RoomPlaywright extends BasePage {
  /** The text frames this browser has been sent over its WebSockets, in order. What it was told, not what it chose to draw. */
  private readonly framesReceived: string[] = [];

  /** The context of the second browser: its own storage and its own session, never a second page of this one. */
  private secondContext: BrowserContext | undefined;

  constructor(page: Page) {
    super(page);
  }

  /** Starts keeping every text frame this page's WebSockets receive, from before the page opens. */
  startWatching(): void {
    this.page.on("websocket", socket => {
      socket.on("framereceived", ({payload}) => {
        if (typeof payload === "string") {
          this.framesReceived.push(payload);
        }
      });
    });
  }

  /** Asks the server for a private room and opens it in this browser. Returns the room's friend code. */
  async createPrivateRoom(): Promise<string> {
    const response = await this.page.request.post("/api/rooms");
    if (!response.ok()) {
      throw new Error(`POST /api/rooms answered ${response.status()}, not a room.`);
    }

    const body: unknown = await response.json();
    const code = typeof body === "object" && body !== null ? Reflect.get(body, "code") : undefined;
    if (typeof code !== "string") {
      throw new Error("The room's answer carries no friend code.");
    }

    await this.enterRoom(this.page, code);

    return code;
  }

  /** Waits until the server has begun sending this browser the match, which it does once both seats are taken. */
  async waitForTheMatch(): Promise<void> {
    await expect.poll(() => this.hasReceivedSnapshots()).toBe(true);
  }

  /**
   * Opens a second browser, in a context of its own, and takes it into the room `code` names. `beforeOpening` is handed its
   * page first, so a recorder can be attached before anything is sent to it.
   */
  async openSecondBrowser(code: string, beforeOpening: (secondPage: Page) => void): Promise<void> {
    const browser = this.page.context().browser();
    if (!browser) {
      throw new Error("This page has no browser to open a second one beside.");
    }

    this.secondContext = await browser.newContext({baseURL: new URL(this.page.url()).origin});
    const page = await this.secondContext.newPage();
    beforeOpening(page);
    await this.enterRoom(page, code);
  }

  /** Opens the room's page in `page` and waits until its arena is drawn into, as the game's own pages are waited for. */
  private async enterRoom(page: Page, code: string): Promise<void> {
    await page.goto(`/?room=${encodeURIComponent(code)}`);

    const arena = page.getByTestId("arena");
    await expect(arena).toHaveAttribute("data-ready", "true");
    await expect(arena).toHaveAttribute("data-sprites-ready", "true");
  }

  async closeSecondBrowser(): Promise<void> {
    await this.secondContext?.close();
    this.secondContext = undefined;
  }

  /** Whether any snapshot has reached this browser: without it, a snapshot with nobody in it proves nothing. */
  hasReceivedSnapshots(): boolean {
    return snapshotsOfFrames(this.framesReceived).length > 0;
  }

  /** Whether the latest snapshot sent to this browser holds the other seat's fighter. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    const snapshots = snapshotsOfFrames(this.framesReceived);

    return snapshots.at(-1)?.opponent !== undefined;
  }
}
