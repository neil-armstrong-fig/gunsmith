import type {Page} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {RoomConnectionDsl} from "@src/dsl/gunsmith/components/room/components/connection/RoomConnectionDsl";
import {RoomFramesDsl} from "@src/dsl/gunsmith/components/room/components/frames/RoomFramesDsl";
import {RoomPreRoundDsl} from "@src/dsl/gunsmith/components/room/components/pre-round/RoomPreRoundDsl";
import {RoomEntryDsl} from "@src/dsl/gunsmith/components/room/components/room-entry/RoomEntryDsl";
import {RoomSmoothnessDsl} from "@src/dsl/gunsmith/components/room/components/smoothness/RoomSmoothnessDsl";
import {RoomPlaywright} from "@src/dsl/gunsmith/components/room/playwright/RoomPlaywright";
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
  /** This browser's connection to the room: made slow, thinned, cut, kept down and let back. */
  readonly connection: RoomConnectionDsl;
  /** What the server told this browser, and what the page said back, read from the frames. */
  readonly frames: RoomFramesDsl;
  /** How smoothly this browser shows the fighters against what the server sent. */
  readonly smoothness: RoomSmoothnessDsl;
  private readonly room: RoomPlaywright;
  private second: GunsmithDsl | undefined;
  private stranger: GunsmithDsl | undefined;
  /** Whether this player's first weapon is a saved one (`arrangeASavedWeaponForThisPlayer`), so a second browser is told of it as the opponent's. */
  private savedWeaponArranged = false;

  constructor(
    page: Page,
    private readonly makeGunsmith: MakeGunsmith,
  ) {
    this.entry = new RoomEntryDsl(page);
    this.preRound = new RoomPreRoundDsl(page);
    this.connection = new RoomConnectionDsl(page);
    this.frames = new RoomFramesDsl(page);
    this.smoothness = new RoomSmoothnessDsl(page, () => this.secondBrowser());
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
      await this.room.openSecondBrowser(code, async secondPage => {
        this.second = this.makeGunsmith(secondPage);
        this.second.room.startWatching();
        if (this.savedWeaponArranged) {
          await this.second.room.arrangeASavedWeaponForTheOpponent();
        }
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
      await this.room.openSecondBrowser(code, async secondPage => {
        this.second = this.makeGunsmith(secondPage);
        this.second.room.startWatching();
        if (this.savedWeaponArranged) {
          await this.second.room.arrangeASavedWeaponForTheOpponent();
        }
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

  /**
   * Has this player lock in a saved weapon (the rifle's numbers, a mint drawing) for slot 1, as a signed-in player would. The local Worker
   * sees no session and refuses saved ids, so the frames each browser is given are rewritten to say so, the reveal and every snapshot:
   * this browser's as its own, and a second browser's, when it joins, as the opponent's. Say it before `createPrivateRoom`.
   */
  async arrangeASavedWeaponForThisPlayer(): Promise<void> {
    try {
      this.savedWeaponArranged = true;
      await this.room.carryASavedWeaponFirst("player");
    } catch (error) {
      throw new DslError("Failed to arrange a saved weapon for this player", error);
    }
  }

  /** Has the other player's slot 1 be the saved weapon of `arrangeASavedWeaponForThisPlayer`, in the frames this browser is given. Said before its page opens. */
  async arrangeASavedWeaponForTheOpponent(): Promise<void> {
    try {
      await this.room.carryASavedWeaponFirst("opponent");
    } catch (error) {
      throw new DslError("Failed to arrange a saved weapon for the opponent", error);
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
