import type {BrowserContext, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import {DelayedLine} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/DelayedLine";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/ConnectionDelay";
import {fastestMovement} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/FastestMovement";
import {largestJump} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/LargestJump";
import type {PositionSample} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/types/PositionSample";
import type {ShownSamples} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/types/ShownSamples";
import {isSnapshotFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsSnapshotFrame";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** The page's own list of where it showed the player each frame (`startRecordingTheShownFighters`). */
const SHOWN_SAMPLES_NAME = "gunsmithShownPlayerSamples";

/**
 * The page shows the player this far (tiles) from the latest frame it was given. Walking over a connection held up 300 ms each way, the
 * server's word is about 3.6 tiles behind a page that predicts; a page that waits to be told is a frame or two behind (under one tile).
 */
const AHEAD_BY_TILES = 2;

/** The page and the server agree on where the player is when they are within this (tiles). */
const AGREE_WITHIN_TILES = 0.05;

export class RoomPlaywright extends BasePage {
  /** The text frames this browser has been sent over its WebSockets, in order. What it was told, not what it chose to draw. */
  private readonly framesReceived: string[] = [];

  /** The context of the second browser: its own storage and its own session, never a second page of this one. */
  private secondContext: BrowserContext | undefined;

  /**
   * Whether this page's connection runs through Playwright's WebSocket route (`slowTheConnectionBy`, `receiveOnlyEveryNthSnapshot`).
   * Playwright then reports a frame the moment the server sends it, before any hold-up or thinning, so what the page was given is noted
   * where the route hands it over instead.
   */
  private routed = false;

  /** How late the route delivers each frame, each way. */
  private delay: ConnectionDelay = {milliseconds: 0};

  /** The route hands the page one snapshot in this many. */
  private snapshotsPerHandover = 1;

  constructor(page: Page) {
    super(page);
  }

  /** Starts keeping every text frame this page's WebSockets receive, from before the page opens. */
  startWatching(): void {
    this.page.on("websocket", socket => {
      socket.on("framereceived", ({payload}) => {
        if (typeof payload === "string" && !this.routed) {
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

  /**
   * Makes this browser's connection to the match slow, each way, from the next page it opens: every frame is delivered late, in order. Call it
   * before `createPrivateRoom`. It is Playwright's WebSocket route, so the server and the page are the real ones; only the wire is held up.
   */
  async slowTheConnectionBy(delay: ConnectionDelay): Promise<void> {
    this.delay = delay;
    await this.routeTheConnection();
  }

  /**
   * Hands this browser only every `n`th snapshot the server sends it (the frame that seats it is always handed over), as a server that sent
   * far fewer would. Call it before `createPrivateRoom`, like `slowTheConnectionBy`.
   */
  async receiveOnlyEveryNthSnapshot(n: number): Promise<void> {
    this.snapshotsPerHandover = n;
    await this.routeTheConnection();
  }

  /** Starts noting where the page shows the fighters on every frame it draws, with the browser's own clock, from now until the page closes. */
  async startRecordingTheShownFighters(): Promise<void> {
    await this.page.evaluate<void, string[]>(
      ([hookName, samplesName]) => {
        const samples: ShownSamples = {player: [], opponent: []};
        Reflect.set(window, samplesName ?? "", samples);

        const sample = (): void => {
          const read = Reflect.get(window, hookName ?? "") as (() => GameStateSnapshot) | undefined;
          const seconds = performance.now() / 1000;
          const state = read?.();
          if (state) {
            samples.player.push({seconds, x: state.player.x, y: state.player.y});
          }
          if (state?.opponent?.visible) {
            samples.opponent.push({seconds, x: state.opponent.x, y: state.opponent.y});
          }

          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      },
      [STATE_HOOK_NAME, SHOWN_SAMPLES_NAME],
    );
  }

  /**
   * The largest step the page showed the player take between two frames, since `startRecordingTheShownFighters`, beyond what walking at the
   * server's own pace (`getFastestServerMovement`) explains over the time between them: what a viewer would see as a jump.
   */
  async getLargestShownJump(): Promise<number> {
    const shown = await this.shownSamples();

    return largestJump(shown.player, this.getFastestServerMovement());
  }

  /** As `getLargestShownJump` for the other fighter, whose walking pace (`walkingSpeed`, tiles a second) the other browser's snapshots give. */
  async getLargestShownOpponentJump(walkingSpeed: number): Promise<number> {
    const shown = await this.shownSamples();

    return largestJump(shown.opponent, walkingSpeed);
  }

  /** How many frames the page drew the other fighter on since `startRecordingTheShownFighters`. */
  async getShownOpponentSamples(): Promise<number> {
    const shown = await this.shownSamples();

    return shown.opponent.length;
  }

  /** The fastest the server itself moved this browser's fighter, in tiles a second of game time: what a correct walk looks like. */
  getFastestServerMovement(): number {
    const samples: PositionSample[] = [];
    for (const {position, elapsedSeconds} of snapshotsOfFrames(this.framesReceived)) {
      if (position && elapsedSeconds !== undefined) {
        samples.push({seconds: elapsedSeconds, x: position.x, y: position.y});
      }
    }

    return fastestMovement(samples);
  }

  /** Whether the page shows the player well past where the latest snapshot the server sent has them: it is not waiting to be told. */
  async isShownAheadOfTheServer(): Promise<boolean> {
    const distance = await this.distanceFromTheServersPlayer();

    return distance !== undefined && distance > AHEAD_BY_TILES;
  }

  /** Whether the page shows the player where the latest snapshot the server sent has them. */
  async isShownWhereTheServerHasThem(): Promise<boolean> {
    const distance = await this.distanceFromTheServersPlayer();

    return distance !== undefined && distance < AGREE_WITHIN_TILES;
  }

  /** Whether any snapshot has reached this browser: without it, a snapshot with nobody in it proves nothing. */
  hasReceivedSnapshots(): boolean {
    return snapshotsOfFrames(this.framesReceived).length > 0;
  }

  /**
   * Routes this page's connection to the match through the hold-up and thinning set so far, once: a second call only changes the settings,
   * which each new connection reads.
   */
  private async routeTheConnection(): Promise<void> {
    if (this.routed) {
      return;
    }

    this.routed = true;
    await this.page.routeWebSocket(/\/api\/rooms\/[^/]+\/socket/, pageSide => {
      const serverSide = pageSide.connectToServer();
      const toServer = new DelayedLine(this.delay);
      const toPage = new DelayedLine(this.delay);
      let snapshots = 0;

      pageSide.onMessage(frame => {
        toServer.send(frame, delayed => serverSide.send(delayed));
      });
      serverSide.onMessage(frame => {
        if (typeof frame === "string" && isSnapshotFrame(frame)) {
          snapshots += 1;
          if ((snapshots - 1) % this.snapshotsPerHandover !== 0) {
            return;
          }
        }

        toPage.send(frame, delayed => {
          if (typeof delayed === "string") {
            this.framesReceived.push(delayed);
          }
          pageSide.send(delayed);
        });
      });
    });
  }

  private async shownSamples(): Promise<ShownSamples> {
    const shown = await this.page.evaluate<ShownSamples | undefined, string>(name => {
      return Reflect.get(window, name) as ShownSamples | undefined;
    }, SHOWN_SAMPLES_NAME);

    return shown ?? {player: [], opponent: []};
  }

  /** How far the page's player is from where the latest snapshot has them, in tiles, or `undefined` before any snapshot has a position. */
  private async distanceFromTheServersPlayer(): Promise<number | undefined> {
    const told = snapshotsOfFrames(this.framesReceived).at(-1)?.position;
    if (!told) {
      return undefined;
    }

    const shown = (await this.readGameState()).player;

    return Math.hypot(shown.x - told.x, shown.y - told.y);
  }

  /** Whether the latest snapshot sent to this browser holds the other seat's fighter. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    const snapshots = snapshotsOfFrames(this.framesReceived);

    return snapshots.at(-1)?.opponent !== undefined;
  }
}
