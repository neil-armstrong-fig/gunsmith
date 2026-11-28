import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import {isJoinedFrame} from "@src/dsl/gunsmith/components/room/components/connection/playwright/joined-frame/IsJoinedFrame";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/types/ConnectionDelay";
import type {RoomWire} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/RoomWire";
import {wireOfPage} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/WireOfPage";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RoomConnectionPlaywright extends BasePage {
  private readonly roomWire: RoomWire;

  constructor(page: Page) {
    super(page);
    this.roomWire = wireOfPage(page);
  }

  /** Makes this browser's connection one the spec can cut, from the next page it opens. Call it before `createPrivateRoom`, like `slowTheConnectionBy`. */
  async prepareToLoseTheConnection(): Promise<void> {
    await this.roomWire.prepareToLose();
  }

  /** Cuts this browser's connection to the match, as a dropped network would. The page is left open and has to find its own way back. */
  cutTheConnection(): void {
    this.roomWire.cut();
  }

  /** Cuts this browser's connection and turns every try to make it again away, as a network that stays down would, until `letTheConnectionBack`. */
  keepTheConnectionDown(): void {
    this.roomWire.refuseConnections(true);
    this.roomWire.cut();
  }

  /** Lets this browser's next try to connect through again. */
  letTheConnectionBack(): void {
    this.roomWire.refuseConnections(false);
  }

  /** Whether the page is telling the player that the connection is being made again. */
  async isToldItIsReconnecting(): Promise<boolean> {
    return await this.page.getByTestId("connection-notice").isVisible();
  }

  /**
   * Waits until the server has seated this browser again after it lost its connection or left (the frame that seats it comes once on every
   * connection) and has sent it a snapshot on that connection: it is in the match again. A snapshot already on its way when the connection
   * was cut does not count.
   */
  async waitForTheMatchAgain(): Promise<void> {
    await expect
      .poll(() => {
        const since = this.roomWire.receivedSinceLosing();
        const seatedAgain = since.findIndex(isJoinedFrame);

        return seatedAgain >= 0 && snapshotsOfFrames(since.slice(seatedAgain)).length > 0;
      })
      .toBe(true);
  }

  /** Waits until the server has seated this browser again after it lost its connection or left: the frame that seats it comes once on every connection. */
  async waitToBeSeatedAgain(): Promise<void> {
    await expect.poll(() => this.roomWire.receivedSinceLosing().some(isJoinedFrame)).toBe(true);
  }

  /**
   * Makes this browser's connection to the match slow, each way, from the next page it opens: every frame is delivered late, in order. Call it
   * before `createPrivateRoom`. It is Playwright's WebSocket route, so the server and the page are the real ones; only the wire is held up.
   */
  async slowTheConnectionBy(delay: ConnectionDelay): Promise<void> {
    await this.roomWire.slowBy(delay);
  }

  /**
   * Hands this browser only every `n`th snapshot the server sends it (the frame that seats it is always handed over), as a server that sent
   * far fewer would. Call it before `createPrivateRoom`, like `slowTheConnectionBy`.
   */
  async receiveOnlyEveryNthSnapshot(n: number): Promise<void> {
    await this.roomWire.handOverEveryNthSnapshot(n);
  }
}
