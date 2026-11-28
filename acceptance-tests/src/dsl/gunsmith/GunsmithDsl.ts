import type {Page} from "@playwright/test";
import {ArenaDsl} from "@src/dsl/gunsmith/components/arena/ArenaDsl";
import {BrowserDsl} from "@src/dsl/gunsmith/components/browser/BrowserDsl";
import {BulletsDsl} from "@src/dsl/gunsmith/components/bullets/BulletsDsl";
import {CameraDsl} from "@src/dsl/gunsmith/components/camera/CameraDsl";
import {ClockDsl} from "@src/dsl/gunsmith/components/clock/ClockDsl";
import {DummiesDsl} from "@src/dsl/gunsmith/components/dummies/DummiesDsl";
import {GameMenuDsl} from "@src/dsl/gunsmith/components/game-menu/GameMenuDsl";
import {HudDsl} from "@src/dsl/gunsmith/components/hud/HudDsl";
import {MatchDsl} from "@src/dsl/gunsmith/components/match/MatchDsl";
import {OpponentDsl} from "@src/dsl/gunsmith/components/opponent/OpponentDsl";
import {PickupDsl} from "@src/dsl/gunsmith/components/pickup/PickupDsl";
import {PlayerDsl} from "@src/dsl/gunsmith/components/player/PlayerDsl";
import {PreRoundDsl} from "@src/dsl/gunsmith/components/pre-round/PreRoundDsl";
import {ReferencesDsl} from "@src/dsl/gunsmith/components/references/ReferencesDsl";
import {RingDsl} from "@src/dsl/gunsmith/components/ring/RingDsl";
import {RoomDsl} from "@src/dsl/gunsmith/components/room/RoomDsl";
import {RoundDsl} from "@src/dsl/gunsmith/components/round/RoundDsl";
import {ScenarioDsl} from "@src/dsl/gunsmith/components/scenario/ScenarioDsl";
import {SoundDsl} from "@src/dsl/gunsmith/components/sound/SoundDsl";
import {VisionDsl} from "@src/dsl/gunsmith/components/vision/VisionDsl";
import {WeaponDsl} from "@src/dsl/gunsmith/components/weapon/WeaponDsl";
import {WorkshopDsl} from "@src/dsl/gunsmith/components/workshop/WorkshopDsl";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import {GunsmithPlaywright} from "@src/dsl/gunsmith/playwright/GunsmithPlaywright";

/**
 * The whole game as a spec sees it. Every area is a member of this rather than a fixture of its own, and this holds nothing else but
 * `begin` and `end`, which the fixture calls: a new capability goes on the member it belongs to (`scenario`, `clock`, `browser`, ...).
 */
export class GunsmithDsl {
  private readonly gunsmith: GunsmithPlaywright;

  readonly arena: ArenaDsl;
  readonly browser: BrowserDsl;
  readonly clock: ClockDsl;
  readonly menu: GameMenuDsl;
  readonly player: PlayerDsl;
  readonly bullets: BulletsDsl;
  readonly camera: CameraDsl;
  readonly dummies: DummiesDsl;
  readonly weapon: WeaponDsl;
  readonly hud: HudDsl;
  readonly opponent: OpponentDsl;
  readonly match: MatchDsl;
  readonly pickup: PickupDsl;
  readonly preRound: PreRoundDsl;
  readonly references: ReferencesDsl;
  readonly ring: RingDsl;
  readonly room: RoomDsl;
  readonly scenario: ScenarioDsl;
  readonly round: RoundDsl;
  readonly sound: SoundDsl;
  readonly vision: VisionDsl;
  readonly workshop: WorkshopDsl;

  constructor(page: Page) {
    this.gunsmith = new GunsmithPlaywright(page);

    this.arena = new ArenaDsl(page);
    this.browser = new BrowserDsl(page);
    this.clock = new ClockDsl(page);
    this.menu = new GameMenuDsl(page);
    this.player = new PlayerDsl(page);
    this.bullets = new BulletsDsl(page);
    this.camera = new CameraDsl(page);
    this.dummies = new DummiesDsl(page);
    this.weapon = new WeaponDsl(page);
    this.hud = new HudDsl(page);
    this.opponent = new OpponentDsl(page);
    this.match = new MatchDsl(page);
    this.pickup = new PickupDsl(page);
    this.preRound = new PreRoundDsl(page);
    this.references = new ReferencesDsl(page);
    this.ring = new RingDsl(page);
    this.room = new RoomDsl(page, secondPage => new GunsmithDsl(secondPage));
    this.round = new RoundDsl(page);
    this.scenario = new ScenarioDsl(page);
    this.sound = new SoundDsl(page);
    this.vision = new VisionDsl(page);
    this.workshop = new WorkshopDsl(page);
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
}
