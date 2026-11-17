import type {Page} from "@playwright/test";
import {RoomPlaywright} from "@src/dsl/gunsmith/components/room/playwright/RoomPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/** How to make the DSL of a second browser's page: the whole game as that browser sees it. */
type MakeGunsmith = (page: Page) => GunsmithDsl;

/** A private room two browsers share, reached as `gunsmith.room`. What a browser knows of the other player is what the server sent it. */
export class RoomDsl {
  private readonly room: RoomPlaywright;
  private second: GunsmithDsl | undefined;

  constructor(
    page: Page,
    private readonly makeGunsmith: MakeGunsmith,
  ) {
    this.room = new RoomPlaywright(page);
  }

  /** Begins noting every frame the server sends this browser, from page load, so a snapshot cannot be missed. */
  startWatching(): void {
    this.room.startWatching();
  }

  /** Asks the server for a private room and opens it here. Returns the friend code. */
  async createPrivateRoom(): Promise<string> {
    try {
      return await this.room.createPrivateRoom();
    } catch (error) {
      throw new DslError("Failed to create a private room", error);
    }
  }

  /** Opens a second browser, with a session of its own, in the room `code` names. It is reached as `secondBrowser()`. */
  async joinWithASecondBrowser(code: string): Promise<void> {
    try {
      await this.room.openSecondBrowser(code, secondPage => {
        this.second = this.makeGunsmith(secondPage);
        this.second.room.startWatching();
      });
      await this.secondBrowser().room.waitForTheMatch();
    } catch (error) {
      throw new DslError(`Failed to join room ${code} with a second browser`, error);
    }
  }

  /** Waits until the server has begun sending this browser the match: both seats are taken. */
  async waitForTheMatch(): Promise<void> {
    try {
      await this.room.waitForTheMatch();
    } catch (error) {
      throw new DslError("Failed to wait for the match to begin", error);
    }
  }

  /** The game as the second browser sees it. */
  secondBrowser(): GunsmithDsl {
    if (!this.second) {
      throw new DslError("No second browser has joined the room", undefined);
    }

    return this.second;
  }

  /** Whether the server has sent this browser any snapshot yet. */
  hasReceivedSnapshots(): boolean {
    try {
      return this.room.hasReceivedSnapshots();
    } catch (error) {
      throw new DslError("Failed to read whether snapshots have arrived", error);
    }
  }

  /** Whether the latest snapshot the server sent this browser holds the other player. A hidden player must be absent from it. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    try {
      return this.room.hasBeenToldWhereTheOtherPlayerIs();
    } catch (error) {
      throw new DslError("Failed to read whether the other player is in the latest snapshot", error);
    }
  }

  /** Closes the second browser, if one joined. */
  async end(): Promise<void> {
    await this.room.closeSecondBrowser();
  }
}
