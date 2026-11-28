import type {Page} from "@playwright/test";
import type {RoundSnapshot} from "@gunsmith/shared/state-hook/types/RoundSnapshot";
import {PlayerPlaywright} from "@src/dsl/gunsmith/components/player/playwright/PlayerPlaywright";
import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import {RoundPlaywright} from "@src/dsl/gunsmith/components/round/playwright/RoundPlaywright";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** How long each step of `keepMovingUntil` walks, in game seconds. */
const MOVE_SECONDS = 0.25;

/** A player in a room who keeps asking for something new, walking to and fro, so the room never counts them as gone quiet. */
export class KeepMoving extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Keeps this browser's player asking for something new, walking a little east and then west, for `seconds` of real time: a player who
   * is plainly there, however long the room waits on the other one.
   */
  async untilTheRoundIs(state: RoundSnapshot, timeoutSeconds: number): Promise<void> {
    const round = new RoundPlaywright(this.page);

    await this.keepMovingUntil(async () => (await round.getState()) === state, timeoutSeconds);
  }

  async untilPlayAgainIsOffered(timeoutSeconds: number): Promise<void> {
    const round = new RoundPlaywright(this.page);

    await this.keepMovingUntil(() => round.isPlayAgainOffered(), timeoutSeconds);
  }

  /** Walks to and fro until `isDone` says so, checked after each short walk; throws if it has not by `timeoutSeconds` of real time. */
  private async keepMovingUntil(isDone: () => Promise<boolean>, timeoutSeconds: number): Promise<void> {
    const until = Date.now() + timeoutSeconds * 1000;
    while (Date.now() < until) {
      await this.walkALittle("east");
      if (await isDone()) {
        return;
      }

      await this.walkALittle("west");
      if (await isDone()) {
        return;
      }
    }

    throw new Error(`The room was not as asked after ${timeoutSeconds} seconds of moving.`);
  }

  /**
   * Holds the key for `heading` for about `MOVE_SECONDS` of the page's game time. A round that ends or begins while it is held starts the
   * game's clock again from nothing, which also ends the wait: `PlayerPlaywright.walkFor` would wait for a clock that went back.
   */
  private async walkALittle(heading: Heading): Promise<void> {
    const player = new PlayerPlaywright(this.page);
    await player.startWalking(heading);

    const before = await this.readGameState();
    await this.waitForGameState(
      ({elapsedSeconds}) =>
        elapsedSeconds < before.elapsedSeconds || elapsedSeconds >= before.elapsedSeconds + MOVE_SECONDS,
    );

    await player.stopWalking(heading);
  }
}
