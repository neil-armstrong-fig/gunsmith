import type {Page} from "@playwright/test";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {ArenaDsl} from "@src/dsl/gunsmith/components/arena/ArenaDsl";
import {BulletsDsl} from "@src/dsl/gunsmith/components/bullets/BulletsDsl";
import {CameraDsl} from "@src/dsl/gunsmith/components/camera/CameraDsl";
import {DummiesDsl} from "@src/dsl/gunsmith/components/dummies/DummiesDsl";
import {HudDsl} from "@src/dsl/gunsmith/components/hud/HudDsl";
import {MatchDsl} from "@src/dsl/gunsmith/components/match/MatchDsl";
import {DUEL_SEED} from "@src/dsl/gunsmith/duel/DuelSeed";
import {LONG_DUEL_SEED} from "@src/dsl/gunsmith/duel/LongDuelSeed";
import {OpponentDsl} from "@src/dsl/gunsmith/components/opponent/OpponentDsl";
import {PickupDsl} from "@src/dsl/gunsmith/components/pickup/PickupDsl";
import {PlayerDsl} from "@src/dsl/gunsmith/components/player/PlayerDsl";
import {RingDsl} from "@src/dsl/gunsmith/components/ring/RingDsl";
import {RoomDsl} from "@src/dsl/gunsmith/components/room/RoomDsl";
import {RoundDsl} from "@src/dsl/gunsmith/components/round/RoundDsl";
import {SoundDsl} from "@src/dsl/gunsmith/components/sound/SoundDsl";
import {VisionDsl} from "@src/dsl/gunsmith/components/vision/VisionDsl";
import {WeaponDsl} from "@src/dsl/gunsmith/components/weapon/WeaponDsl";
import {GunsmithPlaywright} from "@src/dsl/gunsmith/playwright/GunsmithPlaywright";
import type {ClosingRingRequest} from "@src/dsl/gunsmith/types/ClosingRingRequest";
import type {PickupDrawingRequest} from "@src/dsl/gunsmith/types/PickupDrawingRequest";
import type {TerrainPictures} from "@src/dsl/gunsmith/types/TerrainPictures";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** The whole game as a spec sees it. Every area is a member of this rather than a fixture of its own. */
export class GunsmithDsl {
  private readonly gunsmith: GunsmithPlaywright;

  readonly arena: ArenaDsl;
  readonly player: PlayerDsl;
  readonly bullets: BulletsDsl;
  readonly camera: CameraDsl;
  readonly dummies: DummiesDsl;
  readonly weapon: WeaponDsl;
  readonly hud: HudDsl;
  readonly opponent: OpponentDsl;
  readonly match: MatchDsl;
  readonly pickup: PickupDsl;
  readonly ring: RingDsl;
  readonly room: RoomDsl;
  readonly round: RoundDsl;
  readonly sound: SoundDsl;
  readonly vision: VisionDsl;

  constructor(page: Page) {
    this.gunsmith = new GunsmithPlaywright(page);

    this.arena = new ArenaDsl(page);
    this.player = new PlayerDsl(page);
    this.bullets = new BulletsDsl(page);
    this.camera = new CameraDsl(page);
    this.dummies = new DummiesDsl(page);
    this.weapon = new WeaponDsl(page);
    this.hud = new HudDsl(page);
    this.opponent = new OpponentDsl(page);
    this.match = new MatchDsl(page);
    this.pickup = new PickupDsl(page);
    this.ring = new RingDsl(page);
    this.room = new RoomDsl(page, secondPage => new GunsmithDsl(secondPage));
    this.round = new RoundDsl(page);
    this.sound = new SoundDsl(page);
    this.vision = new VisionDsl(page);
  }

  /** Asks for a camera that never shakes (`?shake=0`) in whatever the spec opens next, so a screenshot taken at the moment of a hit is of the picture as it stands. */
  keepTheCameraStill(): void {
    try {
      this.gunsmith.keepTheCameraStill();
    } catch (error) {
      throw new DslError("Failed to ask for a camera that does not shake", error);
    }
  }

  /** Asks for reduced motion through the page (`?reducedMotion=1`) in whatever the spec opens next. */
  askForReducedMotion(): void {
    try {
      this.gunsmith.askForReducedMotion();
    } catch (error) {
      throw new DslError("Failed to ask for reduced motion", error);
    }
  }

  /** Has the browser say the person prefers reduced motion (`prefers-reduced-motion: reduce`), as their system setting would, before the spec opens the game. */
  async preferReducedMotion(): Promise<void> {
    try {
      await this.gunsmith.preferReducedMotion();
    } catch (error) {
      throw new DslError("Failed to have the browser prefer reduced motion", error);
    }
  }

  /** Opens the game and waits until the arena is on screen. */
  async begin(): Promise<void> {
    try {
      await this.bullets.startWatching();
      await this.sound.startWatching();
      await this.hud.startWatching();
      this.room.startWatching();
      await this.gunsmith.open();
    } catch (error) {
      throw new DslError("Failed to open the game", error);
    }
  }

  /** Closes whatever the spec opened beside the game, such as the second browser of a room. Runs after every spec. */
  async end(): Promise<void> {
    try {
      await this.room.end();
    } catch (error) {
      throw new DslError("Failed to close what the spec opened beside the game", error);
    }
  }

  /**
   * Opens the duel in place of the practice range: the player and one opponent in an arena. The opponent's choices are
   * drawn from a fixed seed (`DUEL_SEED`), so every run of a spec plays the same duel and only Playwright's timing varies.
   */
  async startDuel(): Promise<void> {
    try {
      await this.gunsmith.openDuel(DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the duel", error);
    }
  }

  /**
   * Opens a duel that lasts long enough for the opponent to run dry and reload (`LONG_DUEL_SEED`), when the player stands
   * still. Every other duel spec uses `startDuel`, whose fights are over before that.
   */
  async startLongDuel(): Promise<void> {
    try {
      await this.gunsmith.openDuel(LONG_DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the long duel", error);
    }
  }

  /** Opens a sparring match: the duel's arena, with an opponent who stands and takes it and never shoots. */
  async startSparring(): Promise<void> {
    try {
      await this.gunsmith.openSparring();
    } catch (error) {
      throw new DslError("Failed to open the sparring match", error);
    }
  }

  /** Opens a sparring match whose pictures are held back on their way to the page until `releasePictures`, and returns while they are. */
  async startSparringWithHeldPictures(): Promise<void> {
    try {
      await this.gunsmith.openSparringWithHeldPictures();
    } catch (error) {
      throw new DslError("Failed to open the sparring match with held pictures", error);
    }
  }

  /** Lets the held pictures through, and waits until the page has them. */
  async releasePictures(): Promise<void> {
    try {
      await this.gunsmith.releasePictures();
    } catch (error) {
      throw new DslError("Failed to release the held pictures", error);
    }
  }

  /** Opens a sparring match whose pictures are not on the server at all. */
  async startSparringWithMissingPictures(seed?: number): Promise<void> {
    try {
      await this.gunsmith.openSparringWithMissingPictures(seed);
    } catch (error) {
      throw new DslError("Failed to open the sparring match with the pictures missing", error);
    }
  }

  /** Opens sparring with what the game draws from a seed (where a weapon lies, where a ring closes) drawn from `seed`. */
  async startSparringWithSeed(seed: number): Promise<void> {
    try {
      await this.gunsmith.openSparringWithSeed(seed);
    } catch (error) {
      throw new DslError(`Failed to open the sparring match with seed ${seed}`, error);
    }
  }

  /** Opens sparring with the weapon lying in the arena drawn as the named drawing, as the game draws a generated weapon. */
  async startSparringWithPickupDrawing(request: PickupDrawingRequest): Promise<void> {
    try {
      await this.gunsmith.openSparringWithPickupDrawing(request);
    } catch (error) {
      throw new DslError(`Failed to open the sparring match with the weapon drawn as ${request.drawing}`, error);
    }
  }

  /**
   * Opens a sparring match that has a ring: the opponent stands still and never shoots, so only the ring can hurt a fighter.
   * The ring starts after `delaySeconds`, closes over `closingSeconds` and closes on a point drawn from `seed`.
   */
  async startClosingRing(request: ClosingRingRequest): Promise<void> {
    try {
      await this.gunsmith.openClosingRing(request);
    } catch (error) {
      throw new DslError("Failed to open the sparring match with a ring", error);
    }
  }

  /**
   * Opens a duel with a ring of its own, in place of the 45 seconds the game's ring waits: the opponent fights and walks in
   * from the ring as it closes. The ring starts after `delaySeconds`, closes over `closingSeconds` and closes on a point drawn from
   * `seed`, which is also the opponent's.
   */
  async startClosingDuel(request: ClosingRingRequest): Promise<void> {
    try {
      await this.gunsmith.openClosingDuel(request);
    } catch (error) {
      throw new DslError("Failed to open the duel with a ring", error);
    }
  }

  /**
   * Opens a duel on the terraced arena, across two levels (low ground in the west where the opponent starts, a platform one level up
   * in the east where the player starts, one stair between them), with a ring of its own as in `startClosingDuel`. One round, no
   * score: the arena, not the match, is what this one is for.
   */
  async startTerracedDuel(request: ClosingRingRequest): Promise<void> {
    try {
      await this.gunsmith.openTerracedDuel(request);
    } catch (error) {
      throw new DslError("Failed to open the duel across two levels", error);
    }
  }

  /**
   * Opens the overlook: the terraced arena with the fighters the other way round, the opponent on the platform and the player on the
   * low ground, a little more than its far range away and in its sight. One round, no score, no ring; the opponent's choices are
   * drawn from `seed`.
   */
  async startOverlookDuel(seed: number): Promise<void> {
    try {
      await this.gunsmith.openOverlookDuel(seed);
    } catch (error) {
      throw new DslError(`Failed to open the overlook duel with seed ${seed}`, error);
    }
  }

  /**
   * Opens the overwatch: a corridor one tile wide, the opponent wandering on its low ground and the player standing on the platform at
   * its end, ten tiles away along the same row, farther than the opponent sees and inside the rifle's reach. One round, no score,
   * no ring; the opponent's choices are drawn from `seed`.
   */
  async startOverwatch(seed: number): Promise<void> {
    try {
      await this.gunsmith.openOverwatch(seed);
    } catch (error) {
      throw new DslError(`Failed to open the overwatch with seed ${seed}`, error);
    }
  }

  /**
   * Opens the pickup race: the duel's arena with the player standing still and the opponent six tiles east, and a weapon lying
   * four tiles from the opponent and eight from the player. One round, no score, no ring; the opponent's choices are drawn from `seed`.
   */
  async startPickupRace(seed: number): Promise<void> {
    try {
      await this.gunsmith.openPickupRace(seed);
    } catch (error) {
      throw new DslError(`Failed to open the pickup race with seed ${seed}`, error);
    }
  }

  /**
   * Opens the fair duel: an arena that looks the same turned half way round (a shared platform in the middle), the fighters at a
   * matching pair of places, each the other's half-turn and both on the low ground, one round, no score, a ring and a weapon lying between them. The pair, who
   * takes which end, and the opponent's choices are drawn from `seed`.
   */
  async startFairDuel(seed: number): Promise<void> {
    try {
      await this.gunsmith.openFairDuel(seed);
    } catch (error) {
      throw new DslError(`Failed to open the fair duel with seed ${seed}`, error);
    }
  }

  /** Opens the heights arena: low ground beside a raised platform, with one stair up, a dummy on each level and no opponent. */
  async startHeights(): Promise<void> {
    try {
      await this.gunsmith.openHeights();
    } catch (error) {
      throw new DslError("Failed to open the heights arena", error);
    }
  }

  async startTerrain(pictures?: TerrainPictures): Promise<void> {
    try {
      await this.gunsmith.openTerrain(pictures);
    } catch (error) {
      throw new DslError("Failed to open the terrain preview", error);
    }
  }

  /**
   * Holds the game still until `runGameFor` lets it move, so a spec can look at what is in the air for a fraction of a second. Open the game first. While it is held,
   * nothing that waits on the game (a wait for a bullet, for health) can finish: let it run first.
   */
  async holdTheGame(): Promise<void> {
    try {
      await this.gunsmith.holdTheGame();
    } catch (error) {
      throw new DslError("Failed to hold the game still", error);
    }
  }

  /** Lets the held game run for `seconds` of its own time, then holds it again. */
  async runGameFor(seconds: number): Promise<void> {
    try {
      await this.gunsmith.runGameFor(seconds);
    } catch (error) {
      throw new DslError(`Failed to run the held game for ${seconds} seconds`, error);
    }
  }

  async resizeWindowTo(size: Size): Promise<void> {
    try {
      await this.gunsmith.resizeWindowTo(size);
    } catch (error) {
      throw new DslError(`Failed to resize the window to ${size.width} by ${size.height}`, error);
    }
  }

  /** How big the browser window is, in pixels. */
  getWindowSize(): Size {
    try {
      return this.gunsmith.getWindowSize();
    } catch (error) {
      throw new DslError("Failed to read how big the window is", error);
    }
  }

  /** Waits until the game's own clock has run `seconds` further. Never sleeps: the game may run fast or slow. */
  async waitForGameSeconds(seconds: number): Promise<void> {
    try {
      await this.gunsmith.waitForGameSeconds(seconds);
    } catch (error) {
      throw new DslError(`Failed to wait for ${seconds} seconds of game time`, error);
    }
  }
}
