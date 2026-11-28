import type {Page} from "@playwright/test";
import {STATE_HOOK_NAME} from "@gunsmith/shared/state-hook/StateHookName";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import {fastestMovement} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/FastestMovement";
import {largestJump} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/LargestJump";
import type {PositionSample} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/types/PositionSample";
import type {ShownSamples} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/types/ShownSamples";
import type {RoomWire} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/RoomWire";
import {wireOfPage} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/WireOfPage";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** The page's own list of where it showed the player each frame (`startRecordingTheShownFighters`). */
const SHOWN_SAMPLES_NAME = "gunsmithShownPlayerSamples";

/**
 * The page shows the player this far (tiles) from the latest frame it was given. Walking over a connection held up 300 ms each way, the
 * server's word is about 3.6 tiles behind a page that predicts; a page that waits to be told is a frame or two behind (under one tile).
 */
const AHEAD_BY_TILES = 2;

/** The page and the server agree on where the player is when they are within this (tiles). */
const AGREE_WITHIN_TILES = 0.05;

export class RoomSmoothnessPlaywright extends BasePage {
  private readonly roomWire: RoomWire;

  constructor(page: Page) {
    super(page);
    this.roomWire = wireOfPage(page);
  }

  /** Starts noting where the page shows the fighters on every frame it draws, with the browser's own clock, from now until the page closes. */
  async startRecordingTheShownFighters(): Promise<void> {
    await this.page.evaluate<void, string[]>(
      ([hookName, samplesName]) => {
        const samples: ShownSamples = {player: [], opponent: []};
        Reflect.set(window, samplesName ?? "", samples);

        const sample = (): void => {
          const read = Reflect.get(window, hookName ?? "") as (() => GameStateSnapshot) | undefined;
          const seconds = performance.now() / 1000;
          const state = read?.();
          if (state) {
            samples.player.push({seconds, x: state.player.x, y: state.player.y});
          }
          if (state?.opponent?.visible) {
            samples.opponent.push({seconds, x: state.opponent.x, y: state.opponent.y});
          }

          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      },
      [STATE_HOOK_NAME, SHOWN_SAMPLES_NAME],
    );
  }

  /**
   * The largest step the page showed the player take between two frames, since `startRecordingTheShownFighters`, beyond what walking at the
   * server's own pace (`getFastestServerMovement`) explains over the time between them: what a viewer would see as a jump.
   */
  async getLargestShownJump(): Promise<number> {
    const shown = await this.shownSamples();

    return largestJump(shown.player, this.getFastestServerMovement());
  }

  /** As `getLargestShownJump` for the other fighter, whose walking pace (`walkingSpeed`, tiles a second) the other browser's snapshots give. */
  async getLargestShownOpponentJump(walkingSpeed: number): Promise<number> {
    const shown = await this.shownSamples();

    return largestJump(shown.opponent, walkingSpeed);
  }

  /** How many frames the page drew the other fighter on since `startRecordingTheShownFighters`. */
  async getShownOpponentSamples(): Promise<number> {
    const shown = await this.shownSamples();

    return shown.opponent.length;
  }

  /** The fastest the server itself moved this browser's fighter, in tiles a second of game time: what a correct walk looks like. */
  getFastestServerMovement(): number {
    const samples: PositionSample[] = [];
    for (const {position, elapsedSeconds} of snapshotsOfFrames(this.roomWire.received())) {
      if (position && elapsedSeconds !== undefined) {
        samples.push({seconds: elapsedSeconds, x: position.x, y: position.y});
      }
    }

    return fastestMovement(samples);
  }

  /** Whether the page shows the player well past where the latest snapshot the server sent has them: it is not waiting to be told. */
  async isShownAheadOfTheServer(): Promise<boolean> {
    const distance = await this.distanceFromTheServersPlayer();

    return distance !== undefined && distance > AHEAD_BY_TILES;
  }

  /** Whether the page shows the player where the latest snapshot the server sent has them. */
  async isShownWhereTheServerHasThem(): Promise<boolean> {
    const distance = await this.distanceFromTheServersPlayer();

    return distance !== undefined && distance < AGREE_WITHIN_TILES;
  }

  private async shownSamples(): Promise<ShownSamples> {
    const shown = await this.page.evaluate<ShownSamples | undefined, string>(name => {
      return Reflect.get(window, name) as ShownSamples | undefined;
    }, SHOWN_SAMPLES_NAME);

    return shown ?? {player: [], opponent: []};
  }

  /** How far the page's player is from where the latest snapshot has them, in tiles, or `undefined` before any snapshot has a position. */
  private async distanceFromTheServersPlayer(): Promise<number | undefined> {
    const told = snapshotsOfFrames(this.roomWire.received()).at(-1)?.position;
    if (!told) {
      return undefined;
    }

    const shown = (await this.readGameState()).player;

    return Math.hypot(shown.x - told.x, shown.y - told.y);
  }
}
