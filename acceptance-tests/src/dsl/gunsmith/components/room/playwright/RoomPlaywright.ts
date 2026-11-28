import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {BrowsersBeside} from "@src/dsl/gunsmith/components/room/playwright/browsers-beside/BrowsersBeside";
import {enterRoom} from "@src/dsl/gunsmith/components/room/playwright/enter-room/EnterRoom";
import {KeepMoving} from "@src/dsl/gunsmith/components/room/playwright/keep-moving/KeepMoving";
import type {RoomAnswer} from "@src/dsl/gunsmith/components/room/playwright/types/RoomAnswer";
import type {SavedWeaponHolder} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/hand-over/types/SavedWeaponHolder";
import type {RoomWire} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/RoomWire";
import {wireOfPage} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/WireOfPage";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RoomPlaywright extends BasePage {
  private readonly roomWire: RoomWire;

  private readonly browsersBeside: BrowsersBeside;

  private readonly keepMoving: KeepMoving;

  /** The room this browser was opened in, so it can come back to it after leaving. */
  private code: string | undefined;

  constructor(page: Page) {
    super(page);
    this.roomWire = wireOfPage(page);
    this.browsersBeside = new BrowsersBeside(page);
    this.keepMoving = new KeepMoving(page);
  }

  /** Starts keeping every text frame this page's WebSockets receive and send, from before the page opens. */
  startWatching(): void {
    this.roomWire.startWatching();
  }

  /**
   * Asks the server for a private room and opens it in this browser. Returns the room's friend code. `limits` shorten how long the room
   * waits for a player: this is the room's first connection, and the room takes its limits from that one alone, so no other page need carry them.
   */
  async createPrivateRoom(limits: RoomLimits = {}): Promise<string> {
    const code = await this.askForRoom();
    this.code = code;
    await enterRoom(this.page, code, limits);
    this.browsersBeside.rememberOrigin();

    return code;
  }

  /** A real browser request supplies the webapp's Origin and exercises credentialed CORS on a split deployment. */
  private async askForRoom(): Promise<string> {
    await this.page.goto("/", {waitUntil: "commit"});
    const apiUrl = process.env["RELEASE_API_URL"] ?? new URL(this.page.url()).origin;
    const answer = await this.page.evaluate(async (url): Promise<RoomAnswer> => {
      const response = await fetch(new URL("/api/rooms", url), {method: "POST", credentials: "include"});

      return {status: response.status, body: await response.json()};
    }, apiUrl);
    if (answer.status !== 201) {
      throw new Error(`POST /api/rooms answered ${answer.status}, not a room.`);
    }

    const code = typeof answer.body === "object" && answer.body !== null ? Reflect.get(answer.body, "code") : undefined;
    if (typeof code !== "string") {
      throw new Error("The room's answer carries no friend code.");
    }

    return code;
  }

  /** Leaves the room as a closed tab does: the page goes away and its connection with it. */
  async leaveTheRoom(): Promise<void> {
    this.roomWire.markLosing();
    await this.page.goto("about:blank");
  }

  /** Opens the room this browser left again, in the same tab, so what the page kept for the room (its seat's key) is still there. */
  async returnToTheRoom(): Promise<void> {
    if (!this.code) {
      throw new Error("This browser never opened a room to return to.");
    }

    await enterRoom(this.page, this.code);
  }

  /** Waits until the server has begun sending this browser the match, which it does once both seats are taken. */
  async waitForTheMatch(): Promise<void> {
    await expect.poll(() => snapshotsOfFrames(this.roomWire.received()).length > 0).toBe(true);
  }

  /**
   * Opens a second browser, in a context of its own, and takes it into the room `code` names. `beforeOpening` is handed its
   * page first, so a recorder can be attached before anything is sent to it.
   */
  async openSecondBrowser(code: string, beforeOpening: (secondPage: Page) => Promise<void>): Promise<void> {
    await this.browsersBeside.openSecond(code, beforeOpening);
  }

  /** Opens a second browser, in a context of its own, with this browser's origin, and leaves it where it is. `beforeOpening` is handed its page first. */
  async openSecondBrowserBeside(beforeOpening: (secondPage: Page) => void): Promise<void> {
    await this.browsersBeside.openSecondBeside(beforeOpening);
  }

  /** Opens a browser with no seat in the room `code` names, and waits until the server has turned its connection away. */
  async openStrangersBrowser(code: string, beforeOpening: (strangerPage: Page) => void): Promise<void> {
    await this.browsersBeside.openStranger(code, beforeOpening);
  }

  /** Keeps this browser's player walking to and fro until the round is `state` on their screen. */
  async keepMovingUntilTheRoundIs(state: RoundSnapshot, timeoutSeconds: number): Promise<void> {
    await this.keepMoving.untilTheRoundIs(state, timeoutSeconds);
  }

  /** Keeps this browser's player walking to and fro until the banner offers "Play again". */
  async keepMovingUntilPlayAgainIsOffered(timeoutSeconds: number): Promise<void> {
    await this.keepMoving.untilPlayAgainIsOffered(timeoutSeconds);
  }

  /** Closes the second browser and the stranger's, whichever were opened. */
  async closeSecondBrowser(): Promise<void> {
    await this.browsersBeside.closeAll();
  }

  /**
   * Makes the frames this browser is given say that `holder` locked in a saved weapon (a mint drawing) for slot 1, from the next page it
   * opens: the reveal names it and the snapshots carry its key and name. The local Worker sees no session and refuses saved ids, so this
   * stands in for a signed-in seat. Call it before `createPrivateRoom`, like `slowTheConnectionBy`.
   */
  async carryASavedWeaponFirst(holder: SavedWeaponHolder): Promise<void> {
    await this.roomWire.carryASavedWeaponFirst(holder);
  }
}
