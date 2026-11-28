import type {Page} from "@playwright/test";
import {RoomSmoothnessPlaywright} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/RoomSmoothnessPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {GunsmithDsl} from "@src/dsl/gunsmith/GunsmithDsl";

/** The game as the room's second browser sees it, whose snapshots give the other fighter's walking pace. */
type SecondBrowser = () => GunsmithDsl;

/**
 * How smoothly this browser shows the fighters against what the server sent, reached as `gunsmith.room.smoothness`: asserted as a state
 * or a measured step, never as a time.
 */
export class RoomSmoothnessDsl {
  private readonly smoothness: RoomSmoothnessPlaywright;

  constructor(
    page: Page,
    private readonly secondBrowser: SecondBrowser,
  ) {
    this.smoothness = new RoomSmoothnessPlaywright(page);
  }

  /** Starts noting where this browser draws both fighters on every frame, so the largest jump either was seen to make can be read. */
  async startRecordingTheShownFighters(): Promise<void> {
    try {
      await this.smoothness.startRecordingTheShownFighters();
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
      return await this.smoothness.getLargestShownJump();
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
      return await this.smoothness.getLargestShownOpponentJump(
        this.secondBrowser().room.smoothness.getFastestServerMovement(),
      );
    } catch (error) {
      throw new DslError("Failed to read the largest shown jump of the other player", error);
    }
  }

  /** How many frames this browser drew the other player on since recording began: a jump measured over none says nothing. */
  async getShownOpponentSamples(): Promise<number> {
    try {
      return await this.smoothness.getShownOpponentSamples();
    } catch (error) {
      throw new DslError("Failed to count the frames the other player was drawn on", error);
    }
  }

  /** The fastest the server moved this browser's player, in tiles a second of game time, from the snapshots it sent. */
  getFastestServerMovement(): number {
    try {
      return this.smoothness.getFastestServerMovement();
    } catch (error) {
      throw new DslError("Failed to read the fastest movement the server sent", error);
    }
  }

  /** Whether this browser shows the player well ahead of where the latest snapshot has them, as it must when walking over a slow connection. */
  async isShownAheadOfTheServer(): Promise<boolean> {
    try {
      return await this.smoothness.isShownAheadOfTheServer();
    } catch (error) {
      throw new DslError("Failed to compare the shown player with the server's", error);
    }
  }

  /** Whether this browser shows the player where the latest snapshot has them. */
  async isShownWhereTheServerHasThem(): Promise<boolean> {
    try {
      return await this.smoothness.isShownWhereTheServerHasThem();
    } catch (error) {
      throw new DslError("Failed to compare the shown player with the server's", error);
    }
  }
}
