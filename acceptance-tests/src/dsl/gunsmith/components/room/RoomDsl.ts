import type {Page} from "@playwright/test";
import {RoomPlaywright} from "@src/dsl/gunsmith/components/room/playwright/RoomPlaywright";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/ConnectionDelay";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/** How to make the DSL of a second browser's page: the whole game as that browser sees it. */
type MakeGunsmith = (page: Page) => GunsmithDsl;

/** A private room two browsers share, reached as `gunsmith.room`. What a browser knows of the other player is what the server sent it. */
export class RoomDsl {
  private readonly room: RoomPlaywright;
  private second: GunsmithDsl | undefined;
  private stranger: GunsmithDsl | undefined;

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

  /**
   * Asks the server for a private room and opens it here. Returns the friend code. `limits` make the room wait less than the real 30 and
   * 60 seconds for a player who has left or has asked for nothing new.
   */
  async createPrivateRoom(limits: RoomLimits = {}): Promise<string> {
    try {
      return await this.room.createPrivateRoom(limits);
    } catch (error) {
      throw new DslError("Failed to create a private room", error);
    }
  }

  /** Keeps this browser's player asking for something new, walking to and fro, for `seconds`: they are plainly there. */
  async keepMovingFor(seconds: number): Promise<void> {
    try {
      await this.room.keepMovingFor(seconds);
    } catch (error) {
      throw new DslError(`Failed to keep moving for ${seconds} seconds`, error);
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

  /** Opens a third browser, with no seat of its own, in the room `code` names: a stranger who has the friend code. It is reached as `strangersBrowser()`. */
  async joinAsAStranger(code: string): Promise<void> {
    try {
      await this.room.openStrangersBrowser(code, strangerPage => {
        this.stranger = this.makeGunsmith(strangerPage);
        this.stranger.room.startWatching();
      });
    } catch (error) {
      throw new DslError(`Failed to join room ${code} as a stranger`, error);
    }
  }

  /** The game as the stranger's browser sees it. */
  strangersBrowser(): GunsmithDsl {
    try {
      if (!this.stranger) {
        throw new Error("No stranger has opened the room");
      }

      return this.stranger;
    } catch (error) {
      throw new DslError("Failed to get the game as the stranger's browser sees it", error);
    }
  }

  /** Makes this browser's connection one that `cutTheConnection` can cut. Say it before `createPrivateRoom`. */
  async prepareToLoseTheConnection(): Promise<void> {
    try {
      await this.room.prepareToLoseTheConnection();
    } catch (error) {
      throw new DslError("Failed to prepare to lose the connection", error);
    }
  }

  /** Cuts this browser's connection to the match, as a dropped network would; the page stays open and has to reconnect by itself. */
  cutTheConnection(): void {
    try {
      this.room.cutTheConnection();
    } catch (error) {
      throw new DslError("Failed to cut the connection", error);
    }
  }

  /** Cuts this browser's connection and turns away every try to make it again, as a network that stays down would, until `letTheConnectionBack`. */
  keepTheConnectionDown(): void {
    try {
      this.room.keepTheConnectionDown();
    } catch (error) {
      throw new DslError("Failed to keep the connection down", error);
    }
  }

  /** Lets this browser's next try to connect through again. */
  letTheConnectionBack(): void {
    try {
      this.room.letTheConnectionBack();
    } catch (error) {
      throw new DslError("Failed to let the connection back", error);
    }
  }

  /** Whether the page is telling the player that the connection is being made again. */
  async isToldItIsReconnecting(): Promise<boolean> {
    try {
      return await this.room.isToldItIsReconnecting();
    } catch (error) {
      throw new DslError("Failed to read whether the page says it is reconnecting", error);
    }
  }

  /** Leaves the room as a closed tab does. */
  async leaveTheRoom(): Promise<void> {
    try {
      await this.room.leaveTheRoom();
    } catch (error) {
      throw new DslError("Failed to leave the room", error);
    }
  }

  /** Comes back to the room this browser left, in the same tab. */
  async returnToTheRoom(): Promise<void> {
    try {
      await this.room.returnToTheRoom();
    } catch (error) {
      throw new DslError("Failed to return to the room", error);
    }
  }

  /** Waits until the server has sent this browser a snapshot since it lost its connection or left. */
  async waitForTheMatchAgain(): Promise<void> {
    try {
      await this.room.waitForTheMatchAgain();
    } catch (error) {
      throw new DslError("Failed to wait for the match again", error);
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

  /** Whether the latest snapshot the server sent this browser holds the weapon lying in the arena. One this player cannot see, or one already taken, must be absent from it. */
  hasBeenToldWhereTheWeaponLies(): boolean {
    try {
      return this.room.hasBeenToldWhereTheWeaponLies();
    } catch (error) {
      throw new DslError("Failed to read whether the weapon is in the latest snapshot", error);
    }
  }

  /** Every event the server has told this browser about its own player, in order, exactly as the frames carried them: what a shot did to it, what its shots did, and the direction a shot was heard from. */
  getEventsReceived(): readonly unknown[] {
    try {
      return this.room.getEventsReceived();
    } catch (error) {
      throw new DslError("Failed to read the events the server sent", error);
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
