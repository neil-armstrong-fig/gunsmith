import type {Page} from "@playwright/test";
import {DUEL_SEED} from "@src/dsl/gunsmith/components/scenario/duel-seeds/DuelSeed";
import {LONG_DUEL_SEED} from "@src/dsl/gunsmith/components/scenario/duel-seeds/LongDuelSeed";
import {ScenarioPlaywright} from "@src/dsl/gunsmith/components/scenario/playwright/ScenarioPlaywright";
import type {ClosingRingRequest} from "@src/dsl/gunsmith/components/scenario/types/ClosingRingRequest";
import type {PickupDrawingRequest} from "@src/dsl/gunsmith/components/scenario/types/PickupDrawingRequest";
import type {TerrainPictures} from "@src/dsl/gunsmith/components/scenario/types/TerrainPictures";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/**
 * What the spec opens, reached as `gunsmith.scenario`: the duel, sparring and the arenas built for one criterion each (`?scenario=`), and
 * what to ask of the page (`?shake=0`, `?fog=off`, `?reducedMotion=1`) in whatever opens next. They are one domain because the asking and the
 * opening share what the spec has asked for.
 */
export class ScenarioDsl {
  private readonly scenario: ScenarioPlaywright;

  constructor(page: Page) {
    this.scenario = new ScenarioPlaywright(page);
  }

  /** Asks for a camera that never shakes (`?shake=0`) in whatever the spec opens next, so a screenshot taken at the moment of a hit is of the picture as it stands. */
  keepTheCameraStill(): void {
    try {
      this.scenario.keepTheCameraStill();
    } catch (error) {
      throw new DslError("Failed to ask for a camera that does not shake", error);
    }
  }

  /**
   * Asks for the fog's veil to be left out (`?fog=off`) in whatever the spec opens next, so a screenshot of the terrain's pictures is
   * not darkened where the player cannot see. Sight itself is unchanged: what the player cannot see is still not drawn.
   */
  hideTheFog(): void {
    try {
      this.scenario.hideTheFog();
    } catch (error) {
      throw new DslError("Failed to ask for the fog to be hidden", error);
    }
  }

  /** Asks for reduced motion through the page (`?reducedMotion=1`) in whatever the spec opens next. */
  askForReducedMotion(): void {
    try {
      this.scenario.askForReducedMotion();
    } catch (error) {
      throw new DslError("Failed to ask for reduced motion", error);
    }
  }

  /**
   * Opens the duel in place of the practice range: the player and one opponent in an arena. The opponent's choices are
   * drawn from a fixed seed (`DUEL_SEED`), so every run of a spec plays the same duel and only Playwright's timing varies.
   */
  async startDuel(): Promise<void> {
    try {
      await this.scenario.openDuel(DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the duel", error);
    }
  }

  /**
   * Opens the practice range with the duel's fixed seed (`DUEL_SEED`) in its address, so a bot game started from its menu plays the same duel
   * every run: on that seed the bot beats a player who stands still in 2.3 game seconds. Without it every bot game is a new random duel.
   */
  async openTheSeededPracticeRange(): Promise<void> {
    try {
      await this.scenario.openPracticeRange(DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the practice range with the duel's seed", error);
    }
  }

  /** Opens the duel as the practice range's "Start bot game" does: the match waits behind the pre-round, where weapons are chosen, until the player starts it. */
  async startDuelWithPreRound(): Promise<void> {
    try {
      await this.scenario.openDuelWithPreRound(DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the duel with its pre-round", error);
    }
  }

  /**
   * Opens a duel that lasts long enough for the opponent to run dry and reload (`LONG_DUEL_SEED`), when the player stands
   * still. Every other duel spec uses `startDuel`, whose fights are over before that.
   */
  async startLongDuel(): Promise<void> {
    try {
      await this.scenario.openDuel(LONG_DUEL_SEED);
    } catch (error) {
      throw new DslError("Failed to open the long duel", error);
    }
  }

  /** Opens a sparring match: the duel's arena, with an opponent who stands and takes it and never shoots. */
  async startSparring(): Promise<void> {
    try {
      await this.scenario.openSparring();
    } catch (error) {
      throw new DslError("Failed to open the sparring match", error);
    }
  }

  /** Opens a sparring match whose pictures are held back on their way to the page until `releasePictures`, and returns while they are. */
  async startSparringWithHeldPictures(): Promise<void> {
    try {
      await this.scenario.openSparringWithHeldPictures();
    } catch (error) {
      throw new DslError("Failed to open the sparring match with held pictures", error);
    }
  }

  /** Lets the held pictures through, and waits until the page has them. */
  async releasePictures(): Promise<void> {
    try {
      await this.scenario.releasePictures();
    } catch (error) {
      throw new DslError("Failed to release the held pictures", error);
    }
  }

  /** Opens a sparring match whose pictures are not on the server at all. */
  async startSparringWithMissingPictures(seed?: number): Promise<void> {
    try {
      await this.scenario.openSparringWithMissingPictures(seed);
    } catch (error) {
      throw new DslError("Failed to open the sparring match with the pictures missing", error);
    }
  }

  async startSparringWithMissingRifle(): Promise<void> {
    try {
      await this.scenario.openSparringWithMissingRifle();
    } catch (error) {
      throw new DslError("Failed to open sparring with the rifle picture missing", error);
    }
  }

  /** Opens sparring with what the game draws from a seed (where a weapon lies, where a ring closes) drawn from `seed`. */
  async startSparringWithSeed(seed: number): Promise<void> {
    try {
      await this.scenario.openSparringWithSeed(seed);
    } catch (error) {
      throw new DslError(`Failed to open the sparring match with seed ${seed}`, error);
    }
  }

  /** Opens sparring with the weapon lying in the arena drawn as the named drawing, as the game draws a generated weapon. */
  async startSparringWithPickupDrawing(request: PickupDrawingRequest): Promise<void> {
    try {
      await this.scenario.openSparringWithPickupDrawing(request);
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
      await this.scenario.openClosingRing(request);
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
      await this.scenario.openClosingDuel(request);
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
      await this.scenario.openTerracedDuel(request);
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
      await this.scenario.openOverlookDuel(seed);
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
      await this.scenario.openOverwatch(seed);
    } catch (error) {
      throw new DslError(`Failed to open the overwatch with seed ${seed}`, error);
    }
  }

  /**
   * Opens the cover hall: a hall one tile wide and ten tiles long, with a low cover block at its third and its eighth tile. The player
   * and the opponent each stand in the two tiles behind their own block, right beside it, seven tiles apart along one row, so every shot
   * along the row crosses both blocks. One round, no score, no ring; the opponent's choices are drawn from `seed`.
   */
  async startCoverHall(seed: number): Promise<void> {
    try {
      await this.scenario.openCoverHall(seed);
    } catch (error) {
      throw new DslError(`Failed to open the cover hall with seed ${seed}`, error);
    }
  }

  /**
   * Opens the cover run: open low ground with one low cover block and nothing else that hides anyone. The player stands facing east;
   * the opponent stands eight tiles east of them on the same row, two tiles past the block, with an empty magazine, so it reloads first.
   * One round, no score, no ring; the opponent's choices are drawn from `seed`.
   */
  async startCoverRun(seed: number): Promise<void> {
    try {
      await this.scenario.openCoverRun(seed);
    } catch (error) {
      throw new DslError(`Failed to open the cover run with seed ${seed}`, error);
    }
  }

  /**
   * Opens the mutual knockout: the duel's first round of a match, the opponent standing unarmed, and one shot in the air from each fighter at the
   * other, each landing in the first step and each enough to bring its target down, so both fall together and the round is drawn.
   */
  async startMutualKnockout(): Promise<void> {
    try {
      await this.scenario.openMutualKnockout();
    } catch (error) {
      throw new DslError("Failed to open the mutual knockout", error);
    }
  }

  /**
   * Opens the pickup race: the duel's arena with the player standing still and the opponent six tiles east, and a weapon lying
   * four tiles from the opponent and eight from the player. One round, no score, no ring; the opponent's choices are drawn from `seed`.
   */
  async startPickupRace(seed: number): Promise<void> {
    try {
      await this.scenario.openPickupRace(seed);
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
      await this.scenario.openFairDuel(seed);
    } catch (error) {
      throw new DslError(`Failed to open the fair duel with seed ${seed}`, error);
    }
  }

  /** Opens the heights arena: low ground beside a raised platform, with one stair up, a dummy on each level and no opponent. */
  async startHeights(): Promise<void> {
    try {
      await this.scenario.openHeights();
    } catch (error) {
      throw new DslError("Failed to open the heights arena", error);
    }
  }

  /** Opens the cover arena: open low ground with two low cover blocks, three dummies east of them (one standing behind a block, one crouched behind a block, one crouched in the open) and no opponent. */
  async startCover(): Promise<void> {
    try {
      await this.scenario.openCover();
    } catch (error) {
      throw new DslError("Failed to open the cover arena", error);
    }
  }

  async startTerrain(pictures?: TerrainPictures): Promise<void> {
    try {
      await this.scenario.openTerrain(pictures);
    } catch (error) {
      throw new DslError("Failed to open the terrain preview", error);
    }
  }
}
