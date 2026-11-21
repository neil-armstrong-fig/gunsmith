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
import {isJoinedFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsJoinedFrame";
import {isSnapshotFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsSnapshotFrame";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/address/AddressOfRoom";
import {RoundPlaywright} from "@src/dsl/gunsmith/components/round/playwright/RoundPlaywright";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {PlayerPlaywright} from "@src/dsl/gunsmith/components/player/playwright/PlayerPlaywright";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import type {RoomAnswer} from "@src/dsl/gunsmith/components/room/playwright/types/RoomAnswer";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** How long each step of `keepMovingUntil` walks, in game seconds. */
const MOVE_SECONDS = 0.25;

/** The page's own list of where it showed the player each frame (`startRecordingTheShownFighters`). */
const SHOWN_SAMPLES_NAME = "gunsmithShownPlayerSamples";

/**
 * The page shows the player this far (tiles) from the latest frame it was given. Walking over a connection held up 300 ms each way, the
 * server's word is about 3.6 tiles behind a page that predicts; a page that waits to be told is a frame or two behind (under one tile).
 */
const AHEAD_BY_TILES = 2;

/** The page and the server agree on where the player is when they are within this (tiles). */
const AGREE_WITHIN_TILES = 0.05;

/** A browser opened beside this one, with a session of its own. */
interface NewBrowser {
  context: BrowserContext;
  page: Page;
}

export class RoomPlaywright extends BasePage {
  /** The text frames this browser has been sent over its WebSockets, in order. What it was told, not what it chose to draw. */
  private readonly framesReceived: string[] = [];

  /** The context of the second browser: its own storage and its own session, never a second page of this one. */
  private secondContext: BrowserContext | undefined;

  /** The context of a stranger's browser, which has no seat of its own and tries to take one. */
  private strangerContext: BrowserContext | undefined;

  /** The room this browser was opened in, so it can come back to it after leaving. */
  private code: string | undefined;

  /** The site's address, kept from when the room was opened: after this browser leaves, its page has none to give. */
  private origin = "";

  /** How many frames this browser had been sent when it last lost its connection or left: frames after it are the ones that come from being back. */
  private framesBeforeLosing = 0;

  /** Whether every try to connect is being turned away (`keepTheConnectionDown`). */
  private connectionsRefused = false;

  /** Cuts the connection this page has to the match now, as a dropped network would: the server's end and the page's. Set by the route. */
  private cutConnection: (() => void) | undefined;

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

  /**
   * Asks the server for a private room and opens it in this browser. Returns the room's friend code. `limits` shorten how long the room
   * waits for a player: this is the room's first connection, and the room takes its limits from that one alone, so no other page need carry them.
   */
  async createPrivateRoom(limits: RoomLimits = {}): Promise<string> {
    const code = await this.askForRoom();
    this.code = code;
    await this.enterRoom(this.page, code, limits);
    this.origin = new URL(this.page.url()).origin;

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

  /** Makes this browser's connection one the spec can cut, from the next page it opens. Call it before `createPrivateRoom`, like `slowTheConnectionBy`. */
  async prepareToLoseTheConnection(): Promise<void> {
    await this.routeTheConnection();
  }

  /** Cuts this browser's connection to the match, as a dropped network would. The page is left open and has to find its own way back. */
  cutTheConnection(): void {
    if (!this.cutConnection) {
      throw new Error(
        "This page's connection is not routed: call prepareToLoseTheConnection before createPrivateRoom.",
      );
    }

    this.framesBeforeLosing = this.framesReceived.length;
    this.cutConnection();
  }

  /** Cuts this browser's connection and turns every try to make it again away, as a network that stays down would, until `letTheConnectionBack`. */
  keepTheConnectionDown(): void {
    this.connectionsRefused = true;
    this.cutTheConnection();
  }

  /** Lets this browser's next try to connect through again. */
  letTheConnectionBack(): void {
    this.connectionsRefused = false;
  }

  /** Whether the page is telling the player that the connection is being made again. */
  async isToldItIsReconnecting(): Promise<boolean> {
    return await this.page.getByTestId("connection-notice").isVisible();
  }

  /** Leaves the room as a closed tab does: the page goes away and its connection with it. */
  async leaveTheRoom(): Promise<void> {
    this.framesBeforeLosing = this.framesReceived.length;
    await this.page.goto("about:blank");
  }

  /** Opens the room this browser left again, in the same tab, so what the page kept for the room (its seat's key) is still there. */
  async returnToTheRoom(): Promise<void> {
    if (!this.code) {
      throw new Error("This browser never opened a room to return to.");
    }

    await this.enterRoom(this.page, this.code);
  }

  /**
   * Waits until the server has seated this browser again after it lost its connection or left (the frame that seats it comes once on every
   * connection) and has sent it a snapshot on that connection: it is in the match again. A snapshot already on its way when the connection
   * was cut does not count.
   */
  async waitForTheMatchAgain(): Promise<void> {
    await expect
      .poll(() => {
        const since = this.framesReceived.slice(this.framesBeforeLosing);
        const seatedAgain = since.findIndex(isJoinedFrame);

        return seatedAgain >= 0 && snapshotsOfFrames(since.slice(seatedAgain)).length > 0;
      })
      .toBe(true);
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
    this.secondContext = await this.openBrowserBeside(code, beforeOpening);
  }

  /**
   * Opens a browser with no seat in the room `code` names, as a stranger who has the friend code would, and waits until the server has
   * turned its connection away: the room is full, so the page never has an arena to wait for.
   */
  async openStrangersBrowser(code: string, beforeOpening: (strangerPage: Page) => void): Promise<void> {
    const {context, page} = await this.newBrowserBeside();
    this.strangerContext = context;
    beforeOpening(page);

    const connecting = page.waitForEvent("websocket");
    await page.goto(`/?room=${encodeURIComponent(code)}`);
    const socket = await connecting;
    await socket.waitForEvent("close");
  }

  private async openBrowserBeside(code: string, beforeOpening: (page: Page) => void): Promise<BrowserContext> {
    const {context, page} = await this.newBrowserBeside();
    beforeOpening(page);
    await this.enterRoom(page, code);

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

  /** Opens the room's page in `page`, asking for `limits` if it is the room's first, and waits until its arena is drawn into, as the game's own pages are waited for. */
  private async enterRoom(page: Page, code: string, limits: RoomLimits = {}): Promise<void> {
    await page.goto(addressOfRoom(code, limits));

    const arena = page.getByTestId("arena");
    await expect(arena).toHaveAttribute("data-ready", "true");
    await expect(arena).toHaveAttribute("data-sprites-ready", "true");
  }

  /**
   * Keeps this browser's player asking for something new, walking a little east and then west, for `seconds` of real time: a player who
   * is plainly there, however long the room waits on the other one.
   */
  async keepMovingUntilTheRoundIs(state: RoundSnapshot, timeoutSeconds: number): Promise<void> {
    const round = new RoundPlaywright(this.page);

    await this.keepMovingUntil(async () => (await round.getState()) === state, timeoutSeconds);
  }

  async keepMovingUntilPlayAgainIsOffered(timeoutSeconds: number): Promise<void> {
    const round = new RoundPlaywright(this.page);

    await this.keepMovingUntil(() => round.isPlayAgainOffered(), timeoutSeconds);
  }

  /** Walks to and fro until `isDone` says so, checked after each short walk; throws if it has not by `timeoutSeconds` of real time. */
  private async keepMovingUntil(isDone: () => Promise<boolean>, timeoutSeconds: number): Promise<void> {
    const until = Date.now() + timeoutSeconds * 1000;
    while (Date.now() < until) {
      await this.walkALittle("east");
      if (await isDone()) {
        return;
      }

      await this.walkALittle("west");
      if (await isDone()) {
        return;
      }
    }

    throw new Error(`The room was not as asked after ${timeoutSeconds} seconds of moving.`);
  }

  /**
   * Holds the key for `heading` for about `MOVE_SECONDS` of the page's game time. A round that ends or begins while it is held starts the
   * game's clock again from nothing, which also ends the wait: `PlayerPlaywright.walkFor` would wait for a clock that went back.
   */
  private async walkALittle(heading: Heading): Promise<void> {
    const player = new PlayerPlaywright(this.page);
    await player.startWalking(heading);

    const before = await this.readGameState();
    await this.waitForGameState(
      ({elapsedSeconds}) =>
        elapsedSeconds < before.elapsedSeconds || elapsedSeconds >= before.elapsedSeconds + MOVE_SECONDS,
    );

    await player.stopWalking(heading);
  }

  async closeSecondBrowser(): Promise<void> {
    await this.secondContext?.close();
    this.secondContext = undefined;
    await this.strangerContext?.close();
    this.strangerContext = undefined;
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
      if (this.connectionsRefused) {
        pageSide.close();

        return;
      }

      const serverSide = pageSide.connectToServer();
      this.cutConnection = () => {
        serverSide.close();
        pageSide.close();
      };
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

  /** Every event the server has told this browser, in the order it was told them, as the frames carried them. */
  getEventsReceived(): readonly unknown[] {
    return snapshotsOfFrames(this.framesReceived).flatMap(snapshot => snapshot.events ?? []);
  }

  /** Whether the latest snapshot sent to this browser holds the other seat's fighter. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    const snapshots = snapshotsOfFrames(this.framesReceived);

    return snapshots.at(-1)?.opponent !== undefined;
  }

  /** Whether the latest snapshot sent to this browser holds the weapon lying in the arena. */
  hasBeenToldWhereTheWeaponLies(): boolean {
    const snapshots = snapshotsOfFrames(this.framesReceived);

    return snapshots.at(-1)?.pickup !== undefined;
  }
}
