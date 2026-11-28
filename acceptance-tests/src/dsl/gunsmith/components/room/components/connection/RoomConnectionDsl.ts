import type {Page} from "@playwright/test";
import {RoomConnectionPlaywright} from "@src/dsl/gunsmith/components/room/components/connection/playwright/RoomConnectionPlaywright";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/types/ConnectionDelay";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** This browser's connection to its room, reached as `gunsmith.room.connection`: made slow, thinned, cut, kept down and let back. */
export class RoomConnectionDsl {
  private readonly connection: RoomConnectionPlaywright;

  constructor(page: Page) {
    this.connection = new RoomConnectionPlaywright(page);
  }

  /** Makes this browser's connection one that `cutTheConnection` can cut. Say it before `createPrivateRoom`. */
  async prepareToLoseTheConnection(): Promise<void> {
    try {
      await this.connection.prepareToLoseTheConnection();
    } catch (error) {
      throw new DslError("Failed to prepare to lose the connection", error);
    }
  }

  /** Cuts this browser's connection to the match, as a dropped network would; the page stays open and has to reconnect by itself. */
  cutTheConnection(): void {
    try {
      this.connection.cutTheConnection();
    } catch (error) {
      throw new DslError("Failed to cut the connection", error);
    }
  }

  /** Cuts this browser's connection and turns away every try to make it again, as a network that stays down would, until `letTheConnectionBack`. */
  keepTheConnectionDown(): void {
    try {
      this.connection.keepTheConnectionDown();
    } catch (error) {
      throw new DslError("Failed to keep the connection down", error);
    }
  }

  /** Lets this browser's next try to connect through again. */
  letTheConnectionBack(): void {
    try {
      this.connection.letTheConnectionBack();
    } catch (error) {
      throw new DslError("Failed to let the connection back", error);
    }
  }

  /** Whether the page is telling the player that the connection is being made again. */
  async isToldItIsReconnecting(): Promise<boolean> {
    try {
      return await this.connection.isToldItIsReconnecting();
    } catch (error) {
      throw new DslError("Failed to read whether the page says it is reconnecting", error);
    }
  }

  /** Waits until the server has sent this browser a snapshot since it lost its connection or left. */
  async waitForTheMatchAgain(): Promise<void> {
    try {
      await this.connection.waitForTheMatchAgain();
    } catch (error) {
      throw new DslError("Failed to wait for the match again", error);
    }
  }

  /** Waits until the server has seated this browser again after it lost its connection or left, which is before any match is sent. */
  async waitToBeSeatedAgain(): Promise<void> {
    try {
      await this.connection.waitToBeSeatedAgain();
    } catch (error) {
      throw new DslError("Failed to wait to be seated again", error);
    }
  }

  /** Holds every frame to and from this browser up by `delay`, in order. Say it before `createPrivateRoom`: it applies to the page that opens next. */
  async slowTheConnectionBy(delay: ConnectionDelay): Promise<void> {
    try {
      await this.connection.slowTheConnectionBy(delay);
    } catch (error) {
      throw new DslError("Failed to slow the connection", error);
    }
  }

  /** Hands this browser only every `n`th snapshot the server sends it, as a server that sent far fewer would. Say it before `createPrivateRoom`. */
  async receiveOnlyEveryNthSnapshot(n: number): Promise<void> {
    try {
      await this.connection.receiveOnlyEveryNthSnapshot(n);
    } catch (error) {
      throw new DslError(`Failed to thin the snapshots to every ${n}th`, error);
    }
  }
}
