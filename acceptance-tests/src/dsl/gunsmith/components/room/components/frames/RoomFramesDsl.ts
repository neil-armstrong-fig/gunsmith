import type {Page} from "@playwright/test";
import {RoomFramesPlaywright} from "@src/dsl/gunsmith/components/room/components/frames/playwright/RoomFramesPlaywright";
import type {SentChoice} from "@src/dsl/gunsmith/components/room/components/frames/types/SentChoice";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/**
 * What the server told this browser, and what the page said back, read from the frames themselves, reached as `gunsmith.room.frames`.
 * A fog criterion reads these, never the state hook or the drawing.
 */
export class RoomFramesDsl {
  private readonly frames: RoomFramesPlaywright;

  constructor(page: Page) {
    this.frames = new RoomFramesPlaywright(page);
  }

  hasReceivedSnapshots(): boolean {
    try {
      return this.frames.hasReceivedSnapshots();
    } catch (error) {
      throw new DslError("Failed to read whether snapshots have arrived", error);
    }
  }

  /** Whether the server has sent this browser any frame of the choosing before the match yet. */
  hasReceivedPreRounds(): boolean {
    try {
      return this.frames.hasReceivedPreRounds();
    } catch (error) {
      throw new DslError("Failed to read whether frames of the choosing have arrived", error);
    }
  }

  /** Whether the latest snapshot the server sent this browser holds the other player. A hidden player must be absent from it. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    try {
      return this.frames.hasBeenToldWhereTheOtherPlayerIs();
    } catch (error) {
      throw new DslError("Failed to read whether the other player is in the latest snapshot", error);
    }
  }

  /** Whether the latest snapshot the server sent this browser holds the weapon lying in the arena. One this player cannot see, or one already taken, must be absent from it. */
  hasBeenToldWhereTheWeaponLies(): boolean {
    try {
      return this.frames.hasBeenToldWhereTheWeaponLies();
    } catch (error) {
      throw new DslError("Failed to read whether the weapon is in the latest snapshot", error);
    }
  }

  /** Whether the server has named this browser the other player's weapon in `slot`: it must not until both have locked in that slot. */
  hasBeenToldTheOpponentsWeapon(slot: number): boolean {
    try {
      return this.frames.hasBeenToldTheOpponentsWeapon(slot);
    } catch (error) {
      throw new DslError(`Failed to read whether the other player's weapon ${slot} has been sent`, error);
    }
  }

  /** Whether the server has shown this browser the other player's arena: it must not until both have locked in their arena. */
  hasBeenToldTheOpponentsArena(): boolean {
    try {
      return this.frames.hasBeenToldTheOpponentsArena();
    } catch (error) {
      throw new DslError("Failed to read whether the other player's arena has been sent", error);
    }
  }

  /** Whether the server has sent this browser the reveal of what was decided. */
  hasBeenToldTheReveal(): boolean {
    try {
      return this.frames.hasBeenToldTheReveal();
    } catch (error) {
      throw new DslError("Failed to read whether the reveal has been sent", error);
    }
  }

  /** The built-in arenas the room offers this player today, as the server last told it while choosing; `undefined` before it has. */
  getArenasOffered(): readonly string[] | undefined {
    try {
      return this.frames.getArenasOffered();
    } catch (error) {
      throw new DslError("Failed to read the arenas the room offers", error);
    }
  }

  /** What this browser has put forward in the choosing, in the order it sent it: each weapon with its slot and the arena, a built-in or a saved item. */
  getChoicesSent(): readonly SentChoice[] {
    try {
      return this.frames.getChoicesSent();
    } catch (error) {
      throw new DslError("Failed to read what the page put forward in the choosing", error);
    }
  }

  /** Every event the server has told this browser about its own player, in order, exactly as the frames carried them: what a shot did to it, what its shots did, and the direction a shot was heard from. */
  getEventsReceived(): readonly unknown[] {
    try {
      return this.frames.getEventsReceived();
    } catch (error) {
      throw new DslError("Failed to read the events the server sent", error);
    }
  }
}
