import type {Page} from "@playwright/test";
import {RoomPreRoundPlaywright} from "@src/dsl/gunsmith/components/room/components/pre-round/playwright/RoomPreRoundPlaywright";
import type {ArenaPick} from "@src/dsl/gunsmith/components/room/components/pre-round/types/ArenaPick";
import type {LibraryContents} from "@src/dsl/gunsmith/components/room/components/pre-round/types/LibraryContents";
import type {SavedItemIds} from "@src/dsl/gunsmith/components/room/components/pre-round/types/SavedItemIds";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {RevealPicture} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealPicture";
import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealedWeaponNumbers";

/**
 * What a player in a private room sees while the two players choose before the match, reached as `gunsmith.room.preRound`: the waiting and the
 * clock, one step per weapon and then the arena (each opening when the one before it is locked in), what the other player's weapons and arena
 * show, the pick between two arenas, and the reveal. The pickers themselves (`gunsmith.preRound.choose`, `gunsmith.preRound.arena.choose`) are the
 * same as the practice match's, and so are the reveal's readers.
 */
export class RoomPreRoundDsl {
  private readonly preRound: RoomPreRoundPlaywright;

  constructor(page: Page) {
    this.preRound = new RoomPreRoundPlaywright(page);
  }

  /**
   * Makes this browser's player a signed-in one whose library holds `library` (two saved weapons and an arena unless it says nothing is saved), before
   * the room is opened, and answers the ids its saved items have. The room's server sees no session, so it refuses the saved ids: read what the
   * page offered and sent, not what was played.
   */
  async arrangeSignedInPlayer(library: LibraryContents = "two saved weapons and an arena"): Promise<SavedItemIds> {
    try {
      return await this.preRound.arrangeSignedInPlayer(library);
    } catch (error) {
      throw new DslError("Failed to make the player signed in with a library", error);
    }
  }

  /** Waits until the room's choosing is on the screen. */
  async waitToBeChoosing(): Promise<void> {
    try {
      await this.preRound.waitToBeChoosing();
    } catch (error) {
      throw new DslError("Failed to see the room's choosing on the screen", error);
    }
  }

  /** Whether the room's choosing is on the screen. */
  async isOpen(): Promise<boolean> {
    try {
      return await this.preRound.isOpen();
    } catch (error) {
      throw new DslError("Failed to read whether the room's choosing is on the screen", error);
    }
  }

  /** Whether the screen says the other player has not yet sat. */
  async isWaitingForTheOtherPlayerToSit(): Promise<boolean> {
    try {
      return await this.preRound.isWaitingForTheOtherPlayerToSit();
    } catch (error) {
      throw new DslError("Failed to read whether the screen waits for the other player to sit", error);
    }
  }

  /** The friend code the choosing shows to give the other player, or nothing when it shows none. */
  async getFriendCode(): Promise<string | undefined> {
    try {
      return await this.preRound.getFriendCode();
    } catch (error) {
      throw new DslError("Failed to read the friend code on the choosing", error);
    }
  }

  /** The whole seconds the screen says are left (to choose, or in the reveal), or nothing while it shows no clock. */
  async getSecondsLeft(): Promise<number | undefined> {
    try {
      return await this.preRound.getSecondsLeft();
    } catch (error) {
      throw new DslError("Failed to read the clock on the choosing", error);
    }
  }

  /** Whether the step for the weapon in `slot` is on the screen: the second only once the first is locked in. */
  async hasWeaponStep(slot: number): Promise<boolean> {
    try {
      return await this.preRound.hasWeaponStep(slot);
    } catch (error) {
      throw new DslError(`Failed to read whether the step for weapon ${slot} is on the screen`, error);
    }
  }

  /** Locks in the weapon chosen for `slot`, and waits until its button has gone: the server holds it. */
  async lockInWeapon(slot: number): Promise<void> {
    try {
      await this.preRound.lockInWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to lock in weapon ${slot}`, error);
    }
  }

  /** The name of the weapon locked in for `slot`, or nothing before it is. */
  async getLockedWeapon(slot: number): Promise<string | undefined> {
    try {
      return await this.preRound.getLockedWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to read the weapon locked in for slot ${slot}`, error);
    }
  }

  /** The name of the other player's weapon in `slot` on the screen, or nothing while it is not shown. */
  async getOpponentWeapon(slot: number): Promise<string | undefined> {
    try {
      return await this.preRound.getOpponentWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to read the other player's weapon ${slot} on the screen`, error);
    }
  }

  /** Waits until the other player's weapon in `slot` is shown, and says its name. */
  async waitForTheOpponentWeapon(slot: number): Promise<string> {
    try {
      return await this.preRound.waitForTheOpponentWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to see the other player's weapon ${slot}`, error);
    }
  }

  /** What the card of the other player's weapon in `slot` prints (name, power rating, stats), once it is shown. */
  async getOpponentWeaponNumbers(slot: number): Promise<RevealedWeaponNumbers> {
    try {
      return await this.preRound.getOpponentWeaponNumbers(slot);
    } catch (error) {
      throw new DslError(`Failed to read the numbers of the other player's weapon ${slot}`, error);
    }
  }

  /** The picture on the card of the other player's weapon in `slot` (a drawing, a sprite or none), once it is shown. */
  async getOpponentWeaponPicture(slot: number): Promise<RevealPicture> {
    try {
      return await this.preRound.getOpponentWeaponPicture(slot);
    } catch (error) {
      throw new DslError(`Failed to read the picture of the other player's weapon ${slot}`, error);
    }
  }

  /** Opens the folded weapon of the other player in `slot`, so its power rating and stats are shown. */
  async openTheOpponentWeapon(slot: number): Promise<void> {
    try {
      await this.preRound.openTheOpponentWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to open the other player's weapon ${slot}`, error);
    }
  }

  /** Presses anywhere on the opened card of the other player's weapon in `slot`, which folds it to its picture and name again. */
  async pressTheOpponentWeaponCard(slot: number): Promise<void> {
    try {
      await this.preRound.pressTheOpponentWeaponCard(slot);
    } catch (error) {
      throw new DslError(`Failed to fold the other player's weapon ${slot} by pressing its card`, error);
    }
  }

  /** Whether the other player's weapon in `slot` is shown as a card with its numbers, rather than by its picture and name alone. */
  async isOpponentWeaponShownAsACard(slot: number): Promise<boolean> {
    try {
      return await this.preRound.isOpponentWeaponShownAsACard(slot);
    } catch (error) {
      throw new DslError(`Failed to read whether the other player's weapon ${slot} is shown as a card`, error);
    }
  }

  /** Whether Lock in arena is wholly inside the dialog as the player sees it, with no scrolling. */
  async canLockInTheArenaWithoutScrolling(): Promise<boolean> {
    try {
      return await this.preRound.canLockInTheArenaWithoutScrolling();
    } catch (error) {
      throw new DslError("Failed to read whether the arena can be locked in without scrolling", error);
    }
  }

  /** Whether the arena step is on the screen: only once both weapons are locked in. */
  async hasArenaStep(): Promise<boolean> {
    try {
      return await this.preRound.hasArenaStep();
    } catch (error) {
      throw new DslError("Failed to read whether the arena step is on the screen", error);
    }
  }

  /** Locks in the arena chosen, and waits until its button has gone: the server holds it (or the match has begun). */
  async lockInArena(): Promise<void> {
    try {
      await this.preRound.lockInArena();
    } catch (error) {
      throw new DslError("Failed to lock in the arena", error);
    }
  }

  /** The name of the other player's arena on the screen, or nothing while it is not shown. */
  async getOpponentArena(): Promise<string | undefined> {
    try {
      return await this.preRound.getOpponentArena();
    } catch (error) {
      throw new DslError("Failed to read the other player's arena on the screen", error);
    }
  }

  /** Waits until the other player's arena is shown, and says its name. */
  async waitForTheOpponentArena(): Promise<string> {
    try {
      return await this.preRound.waitForTheOpponentArena();
    } catch (error) {
      throw new DslError("Failed to see the other player's arena", error);
    }
  }

  /** Whether the pick between the two arenas is on the screen. */
  async hasArenaPick(): Promise<boolean> {
    try {
      return await this.preRound.hasArenaPick();
    } catch (error) {
      throw new DslError("Failed to read whether the arena pick is on the screen", error);
    }
  }

  /** Waits until the pick between the two arenas is on the screen. */
  async waitForTheArenaPick(): Promise<void> {
    try {
      await this.preRound.waitForTheArenaPick();
    } catch (error) {
      throw new DslError("Failed to see the arena pick", error);
    }
  }

  /** Picks one of the two arenas, random, or nothing. */
  async pickArena(pick: ArenaPick): Promise<void> {
    try {
      await this.preRound.pickArena(pick);
    } catch (error) {
      throw new DslError(`Failed to pick ${pick}`, error);
    }
  }

  /** How the screen says the arena was settled, once it does. */
  async getHow(): Promise<string> {
    try {
      return await this.preRound.getHow();
    } catch (error) {
      throw new DslError("Failed to read how the arena was settled", error);
    }
  }

  /** Waits until what was decided (the arena and the four weapons) is on the screen. */
  async waitForTheReveal(): Promise<void> {
    try {
      await this.preRound.waitForTheReveal();
    } catch (error) {
      throw new DslError("Failed to see the reveal", error);
    }
  }

  /** Presses Start the match: the match begins when both players have. */
  async askToStartTheMatch(): Promise<void> {
    try {
      await this.preRound.askToStartTheMatch();
    } catch (error) {
      throw new DslError("Failed to ask to start the match", error);
    }
  }

  /** Whether the screen says this player has asked to start and the other has not yet. */
  async isWaitingForTheOtherPlayerToStart(): Promise<boolean> {
    try {
      return await this.preRound.isWaitingForTheOtherPlayerToStart();
    } catch (error) {
      throw new DslError("Failed to read whether the screen waits for the other player to start", error);
    }
  }
}
