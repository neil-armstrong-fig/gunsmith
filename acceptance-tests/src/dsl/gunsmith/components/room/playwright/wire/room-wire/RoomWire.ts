import type {Page} from "@playwright/test";
import {DelayedLine} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/DelayedLine";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/types/ConnectionDelay";
import {HandOver} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/hand-over/HandOver";
import type {SavedWeaponHolder} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/hand-over/types/SavedWeaponHolder";

/**
 * One page's connection to its room, as every part of `gunsmith.room` sees it: the frames it received and sent, and the WebSocket route that can
 * hold them up, thin them, rewrite them or cut them. One per page (`wireOfPage`), so the room's members, each with its own `*Playwright`, share it.
 */
export class RoomWire {
  /** The text frames this browser has been sent over its WebSockets, in order. What it was told, not what it chose to draw. */
  private readonly framesReceived: string[] = [];

  /** The text frames this browser has sent over its WebSockets, in order. What the page chose to say, not what the server made of it. */
  private readonly framesSent: string[] = [];

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

  /** Whose fighter the route makes carry a saved weapon in slot 1 (`carryASavedWeaponFirst`), if anyone's. */
  private savedWeaponHolder: SavedWeaponHolder | undefined;

  constructor(private readonly page: Page) {}

  /** Starts keeping every text frame this page's WebSockets receive and send, from before the page opens. */
  startWatching(): void {
    this.page.on("websocket", socket => {
      socket.on("framesent", ({payload}) => {
        if (typeof payload === "string") {
          this.framesSent.push(payload);
        }
      });
      socket.on("framereceived", ({payload}) => {
        if (typeof payload === "string" && !this.routed) {
          this.framesReceived.push(payload);
        }
      });
    });
  }

  /** Every text frame this page has been sent, in order. */
  received(): readonly string[] {
    return this.framesReceived;
  }

  /** Every text frame this page has sent, in order. */
  sent(): readonly string[] {
    return this.framesSent;
  }

  /** The frames this page has been sent since it last lost its connection or left (`markLosing`). */
  receivedSinceLosing(): readonly string[] {
    return this.framesReceived.slice(this.framesBeforeLosing);
  }

  /** Notes that the page is about to lose its connection or leave, so the frames that come from being back can be told apart. */
  markLosing(): void {
    this.framesBeforeLosing = this.framesReceived.length;
  }

  /** Makes this page's connection one that `cut` can cut, from the next page it opens. */
  async prepareToLose(): Promise<void> {
    await this.route();
  }

  /** Cuts this page's connection to the match, as a dropped network would. */
  cut(): void {
    if (!this.cutConnection) {
      throw new Error(
        "This page's connection is not routed: call prepareToLoseTheConnection before createPrivateRoom.",
      );
    }

    this.markLosing();
    this.cutConnection();
  }

  /** Turns every try to connect away (`true`) or lets them through again (`false`). */
  refuseConnections(refused: boolean): void {
    this.connectionsRefused = refused;
  }

  /** Delivers every frame `delay` late, each way, from the next page it opens. */
  async slowBy(delay: ConnectionDelay): Promise<void> {
    this.delay = delay;
    await this.route();
  }

  /** Hands the page only every `n`th snapshot the server sends it, from the next page it opens. */
  async handOverEveryNthSnapshot(n: number): Promise<void> {
    this.snapshotsPerHandover = n;
    await this.route();
  }

  /** Makes the frames the page is given say that `holder` locked in a saved weapon for slot 1, from the next page it opens. */
  async carryASavedWeaponFirst(holder: SavedWeaponHolder): Promise<void> {
    this.savedWeaponHolder = holder;
    await this.route();
  }

  /**
   * Routes this page's connection to the match through the hold-up and thinning set so far, once: a second call only changes the settings,
   * which each new connection reads.
   */
  private async route(): Promise<void> {
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
      const handOver = new HandOver({
        snapshotsPerHandover: this.snapshotsPerHandover,
        savedWeaponHolder: this.savedWeaponHolder,
      });

      pageSide.onMessage(frame => {
        toServer.send(frame, delayed => serverSide.send(delayed));
      });
      serverSide.onMessage(sent => {
        for (const frame of handOver.framesFor(sent)) {
          toPage.send(frame, delayed => {
            if (typeof delayed === "string") {
              this.framesReceived.push(delayed);
            }
            pageSide.send(delayed);
          });
        }
      });
    });
  }
}
