import type {Page} from "@playwright/test";
import {RoomPlaywright} from "@src/dsl/gunsmith/components/room/playwright/RoomPlaywright";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/ConnectionDelay";
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
    try {
      this.room.startWatching();
    } catch (error) {
      throw new DslError("Failed to start watching the frames the server sends", error);
    }
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
    try {
      if (!this.second) {
        throw new Error("No second browser has joined the room");
      }

      return this.second;
    } catch (error) {
      throw new DslError("Failed to get the game as the second browser sees it", error);
    }
  }

  /** Holds every frame to and from this browser up by `delay`, in order. Say it before `createPrivateRoom`: it applies to the page that opens next. */
  async slowTheConnectionBy(delay: ConnectionDelay): Promise<void> {
    try {
      await this.room.slowTheConnectionBy(delay);
    } catch (error) {
      throw new DslError("Failed to slow the connection", error);
    }
  }

  /** Hands this browser only every `n`th snapshot the server sends it, as a server that sent far fewer would. Say it before `createPrivateRoom`. */
  async receiveOnlyEveryNthSnapshot(n: number): Promise<void> {
    try {
      await this.room.receiveOnlyEveryNthSnapshot(n);
    } catch (error) {
      throw new DslError(`Failed to thin the snapshots to every ${n}th`, error);
    }
  }

  /** Starts noting where this browser draws both fighters on every frame, so the largest jump either was seen to make can be read. */
  async startRecordingTheShownFighters(): Promise<void> {
    try {
      await this.room.startRecordingTheShownFighters();
    } catch (error) {
      throw new DslError("Failed to start recording the shown player", error);
    }
  }

  /**
   * The largest step this browser showed the player take between two frames since recording began, in tiles, beyond what walking at the
   * server's pace explains over the time between them.
   */
  async getLargestShownJump(): Promise<number> {
    try {
      return await this.room.getLargestShownJump();
    } catch (error) {
      throw new DslError("Failed to read the largest shown jump", error);
    }
  }

  /**
   * The largest step this browser showed the other player take between two frames since recording began, in tiles, beyond what walking at
   * the server's pace explains over the time between them. The pace is the second browser's own, from the snapshots it was sent.
   */
  async getLargestShownOpponentJump(): Promise<number> {
    try {
      return await this.room.getLargestShownOpponentJump(this.secondBrowser().room.getFastestServerMovement());
    } catch (error) {
      throw new DslError("Failed to read the largest shown jump of the other player", error);
    }
  }

  /** How many frames this browser drew the other player on since recording began: a jump measured over none says nothing. */
  async getShownOpponentSamples(): Promise<number> {
    try {
      return await this.room.getShownOpponentSamples();
    } catch (error) {
      throw new DslError("Failed to count the frames the other player was drawn on", error);
    }
  }

  /** The fastest the server moved this browser's player, in tiles a second of game time, from the snapshots it sent. */
  getFastestServerMovement(): number {
    try {
      return this.room.getFastestServerMovement();
    } catch (error) {
      throw new DslError("Failed to read the fastest movement the server sent", error);
    }
  }

  /** Whether this browser shows the player well ahead of where the latest snapshot has them, as it must when walking over a slow connection. */
  async isShownAheadOfTheServer(): Promise<boolean> {
    try {
      return await this.room.isShownAheadOfTheServer();
    } catch (error) {
      throw new DslError("Failed to compare the shown player with the server's", error);
    }
  }

  /** Whether this browser shows the player where the latest snapshot has them. */
  async isShownWhereTheServerHasThem(): Promise<boolean> {
    try {
      return await this.room.isShownWhereTheServerHasThem();
    } catch (error) {
      throw new DslError("Failed to compare the shown player with the server's", error);
    }
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
    try {
      await this.room.closeSecondBrowser();
    } catch (error) {
      throw new DslError("Failed to close the second browser", error);
    }
  }
}
