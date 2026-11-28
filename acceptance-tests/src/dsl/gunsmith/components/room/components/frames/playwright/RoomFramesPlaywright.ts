import type {Page} from "@playwright/test";
import {arenasOfferedInFrames} from "@src/dsl/gunsmith/components/room/components/frames/playwright/choosing/ArenasOfferedInFrames";
import {choicesOfSentFrames} from "@src/dsl/gunsmith/components/room/components/frames/playwright/choosing/ChoicesOfSentFrames";
import {preRoundsOfFrames} from "@src/dsl/gunsmith/components/room/components/frames/playwright/choosing/PreRoundsOfFrames";
import type {SentChoice} from "@src/dsl/gunsmith/components/room/components/frames/types/SentChoice";
import {isRevealFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsRevealFrame";
import type {RoomWire} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/RoomWire";
import {wireOfPage} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/WireOfPage";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class RoomFramesPlaywright extends BasePage {
  private readonly roomWire: RoomWire;

  constructor(page: Page) {
    super(page);
    this.roomWire = wireOfPage(page);
  }

  /** Whether any snapshot has reached this browser: without it, a snapshot with nobody in it proves nothing. */
  hasReceivedSnapshots(): boolean {
    return snapshotsOfFrames(this.roomWire.received()).length > 0;
  }

  /** Whether any frame of the choosing before the match has reached this browser: without it, a choosing that told nothing proves nothing. */
  hasReceivedPreRounds(): boolean {
    return preRoundsOfFrames(this.roomWire.received()).length > 0;
  }

  /** Whether the latest snapshot sent to this browser holds the other seat's fighter. */
  hasBeenToldWhereTheOtherPlayerIs(): boolean {
    const snapshots = snapshotsOfFrames(this.roomWire.received());

    return snapshots.at(-1)?.opponent !== undefined;
  }

  /** Whether the latest snapshot sent to this browser holds the weapon lying in the arena. */
  hasBeenToldWhereTheWeaponLies(): boolean {
    const snapshots = snapshotsOfFrames(this.roomWire.received());

    return snapshots.at(-1)?.pickup !== undefined;
  }

  /** Whether any frame sent to this browser has named the other seat's weapon in `slot`. The server must not until both seats have locked in that slot. */
  hasBeenToldTheOpponentsWeapon(slot: number): boolean {
    return preRoundsOfFrames(this.roomWire.received()).some(preRound => {
      if (slot === 1) {
        return preRound.opponentFirstWeaponShown;
      }

      return preRound.opponentSecondWeaponShown;
    });
  }

  /** Whether any frame sent to this browser has shown the other seat's arena. The server must not until both seats have locked in their arena. */
  hasBeenToldTheOpponentsArena(): boolean {
    return preRoundsOfFrames(this.roomWire.received()).some(preRound => preRound.opponentArenaShown);
  }

  /** Whether the server has sent this browser the reveal of what was decided. */
  hasBeenToldTheReveal(): boolean {
    return this.roomWire.received().some(isRevealFrame);
  }

  /** The built-in arenas the room offers this browser while choosing, from the latest pre-round frame it was sent; `undefined` before one comes. */
  getArenasOffered(): readonly string[] | undefined {
    return arenasOfferedInFrames(this.roomWire.received());
  }

  /** What this page has put forward in the choosing, in the order it sent it: each weapon and the arena, a built-in or a saved item. */
  getChoicesSent(): readonly SentChoice[] {
    return choicesOfSentFrames(this.roomWire.sent());
  }

  /** Every event the server has told this browser, in the order it was told them, as the frames carried them. */
  getEventsReceived(): readonly unknown[] {
    return snapshotsOfFrames(this.roomWire.received()).flatMap(snapshot => snapshot.events ?? []);
  }
}
