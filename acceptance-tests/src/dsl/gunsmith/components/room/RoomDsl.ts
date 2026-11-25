import type {Page} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {RoomPreRoundDsl} from "@src/dsl/gunsmith/components/room/components/pre-round/RoomPreRoundDsl";
import {RoomEntryDsl} from "@src/dsl/gunsmith/components/room/components/room-entry/RoomEntryDsl";
import {RoomPlaywright} from "@src/dsl/gunsmith/components/room/playwright/RoomPlaywright";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/ConnectionDelay";
import type {SentChoice} from "@src/dsl/gunsmith/components/room/playwright/wire/types/SentChoice";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/** How to make the DSL of a second browser's page: the whole game as that browser sees it. */
type MakeGunsmith = (page: Page) => GunsmithDsl;

/** A private room two browsers share, reached as `gunsmith.room`. What a browser knows of the other player is what the server sent it. */
export class RoomDsl {
  /** How a player reaches a room from the practice range: make one, or type a friend code in. */
  readonly entry: RoomEntryDsl;
  /** What the room's choosing and reveal show before the match. */
  readonly preRound: RoomPreRoundDsl;
  private readonly room: RoomPlaywright;
  private second: GunsmithDsl | undefined;
  private stranger: GunsmithDsl | undefined;

  constructor(
    page: Page,
    private readonly makeGunsmith: MakeGunsmith,
  ) {
    this.entry = new RoomEntryDsl(page);
    this.preRound = new RoomPreRoundDsl(page);
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

  /**
   * Keeps this browser's player asking for something new, walking to and fro, until the round is `state` on their screen: they are plainly there.
   * It stops at the moment the state is seen, not after a time, so a slow machine cannot carry it past the moment a spec means to read.
   */
  async keepMovingUntilTheRoundIs(state: RoundSnapshot, timeoutSeconds: number): Promise<void> {
    try {
      await this.room.keepMovingUntilTheRoundIs(state, timeoutSeconds);
    } catch (error) {
      throw new DslError(`Failed to keep moving until the round was ${state}`, error);
    }
  }

  /** As `keepMovingUntilTheRoundIs`, until the match is decided and the banner offers a fresh one ("Play again"). */
  async keepMovingUntilPlayAgainIsOffered(timeoutSeconds: number): Promise<void> {
    try {
      await this.room.keepMovingUntilPlayAgainIsOffered(timeoutSeconds);
    } catch (error) {
      throw new DslError("Failed to keep moving until Play again was offered", error);
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

  /**
   * Opens a second browser, with a session of its own, on the practice range with `limits` on its address, as this browser's practice range
   * has them. It is reached as `secondBrowser()`, and its `room.entry` types the friend code in.
   */
  async openASecondBrowserOnThePracticeRange(limits: RoomLimits = {}): Promise<void> {
    try {
      await this.room.openSecondBrowserBeside(secondPage => {
        this.second = this.makeGunsmith(secondPage);
        this.second.room.startWatching();
      });
      await this.secondBrowser().room.entry.openThePracticeRange(limits);
    } catch (error) {
      throw new DslError("Failed to open a second browser on the practice range", error);
    }
  }

  /**
   * Opens a second browser, with a session of its own, in the room `code` names, and waits until its choosing is on the screen. A room with
   * time to choose sends no match until both have chosen, so `joinWithASecondBrowser`, which waits for the match, would wait for ever.
   */
  async joinWithASecondBrowserToChoose(code: string): Promise<void> {
    try {
      await this.room.openSecondBrowser(code, secondPage => {
        this.second = this.makeGunsmith(secondPage);
        this.second.room.startWatching();
      });
      await this.secondBrowser().room.preRound.waitToBeChoosing();
    } catch (error) {
      throw new DslError(`Failed to join room ${code} with a second browser to choose`, error);
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

  /** Waits until the server has seated this browser again after it lost its connection or left, which is before any match is sent. */
  async waitToBeSeatedAgain(): Promise<void> {
    try {
      await this.room.waitToBeSeatedAgain();
    } catch (error) {
      throw new DslError("Failed to wait to be seated again", error);
    }
  }

  /** Whether the server has sent this browser any frame of the choosing before the match yet. */
  hasReceivedPreRounds(): boolean {
    try {
      return this.room.hasReceivedPreRounds();
    } catch (error) {
      throw new DslError("Failed to read whether frames of the choosing have arrived", error);
    }
  }

  /** Whether the server has named this browser the other player's weapon in `slot`: it must not until both have locked in that slot. */
  hasBeenToldTheOpponentsWeapon(slot: number): boolean {
    try {
      return this.room.hasBeenToldTheOpponentsWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to read whether the other player's weapon ${slot} has been sent`, error);
    }
  }

  /** Whether the server has shown this browser the other player's arena: it must not until both have locked in their arena. */
  hasBeenToldTheOpponentsArena(): boolean {
    try {
      return this.room.hasBeenToldTheOpponentsArena();
    } catch (error) {
      throw new DslError("Failed to read whether the other player's arena has been sent", error);
    }
  }

  /** What this browser has put forward in the choosing, in the order it sent it: each weapon with its slot and the arena, a built-in or a saved item. */
  getChoicesSent(): readonly SentChoice[] {
    try {
      return this.room.getChoicesSent();
    } catch (error) {
      throw new DslError("Failed to read what the page put forward in the choosing", error);
    }
  }

  /** Whether the server has sent this browser the reveal of what was decided. */
  hasBeenToldTheReveal(): boolean {
    try {
      return this.room.hasBeenToldTheReveal();
    } catch (error) {
      throw new DslError("Failed to read whether the reveal has been sent", error);
    }
  }

  /** Whether the server has sent this browser any snapshot yet. */
  /** The built-in arenas the room offers this player today, as the server last told it while choosing; `undefined` before it has. */
  getArenasOffered(): readonly string[] | undefined {
    try {
      return this.room.getArenasOffered();
    } catch (error) {
      throw new DslError("Failed to read the arenas the room offers", error);
    }
  }

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
