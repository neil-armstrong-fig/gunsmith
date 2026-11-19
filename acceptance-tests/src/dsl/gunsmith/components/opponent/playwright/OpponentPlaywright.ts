import type {Page} from "@playwright/test";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {runHeldUntil} from "@src/dsl/gunsmith/playwright/hold/RunHeldUntil";
import {hasHeldWeaponAccent} from "@src/dsl/gunsmith/playwright/look/held-weapon/HasHeldWeaponAccent";
import {hasRifleOnScreen} from "@src/dsl/gunsmith/playwright/look/held-rifle/HasRifleOnScreen";
import {lookOfFighter} from "@src/dsl/gunsmith/playwright/look/look-of-fighter/LookOfFighter";
import {lookOfHit} from "@src/dsl/gunsmith/playwright/look/look-of-hit/LookOfHit";
import {TEAM_ORANGE} from "@src/dsl/gunsmith/playwright/look/TeamOrange";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
import type {HitLook} from "@src/dsl/gunsmith/types/HitLook";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";
import type {AimedPoint} from "@src/dsl/gunsmith/types/AimedPoint";
import type {HeldWeaponAccent} from "@src/dsl/gunsmith/types/HeldWeaponAccent";
import type {Point} from "@src/dsl/gunsmith/types/Point";

export class OpponentPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Where the opponent stands and how much health it has left. Throws when the game has no opponent. */
  async get(): Promise<OpponentSnapshot> {
    const {opponent} = await this.readGameState();
    if (!opponent) {
      throw new Error("The game has no opponent in it.");
    }

    return opponent;
  }

  async hasRifleOnScreen(aimedPoint?: AimedPoint): Promise<boolean> {
    if (aimedPoint) {
      return await hasRifleOnScreen(this.page, aimedPoint, aimedPoint.aimDegrees);
    }

    const opponent = await this.get();

    // The stationary sparring opponent starts facing west.
    return await hasRifleOnScreen(this.page, opponent, 180);
  }

  async hasHeldWeaponAccent(accent: HeldWeaponAccent, aimedPoint: AimedPoint): Promise<boolean> {
    return await hasHeldWeaponAccent(this.page, aimedPoint, accent);
  }

  /** What a player sees where the opponent stands: its drawing counted by colour, and the compass points on its outline. The opponent must be standing still (sparring's is). */
  async getLookOnScreen(): Promise<FighterLook> {
    const {x, y} = await this.get();

    return await lookOfFighter(this.page, {x, y}, TEAM_ORANGE);
  }

  /** What the screen shows of a hit landed round the opponent right now: the mint ticks at its corners. The opponent must be standing still (sparring's is). */
  async getHitOnScreen(): Promise<HitLook> {
    const {x, y} = await this.get();

    return await lookOfHit(this.page, {x, y});
  }

  /**
   * Runs a held game (`holdTheGame`) in steps of `stepSeconds` until the opponent has less health than it had, whether or not the player sees it, and stops there.
   * Throws if nothing has hurt it after `maxSeconds` of the game's time.
   */
  async runUntilHurt(request: HurtWatch): Promise<void> {
    const {health} = await this.get();

    await runHeldUntil(this.page, {
      watch: request,
      what: "Something hurting the opponent",
      isDone: async () => (await this.get()).health < health,
    });
  }

  /** Waits until the opponent has less health than `health`. */
  async waitForHealthBelow(health: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.health < health);
  }

  /**
   * Waits until the opponent's behaviour is `behaviour` (`wander`, `engage`, `reload`, `search` or `seek`), for as long as the
   * expect timeout or `timeoutSeconds` allows.
   */
  async waitForBehaviour(behaviour: string, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent?.behaviour === behaviour, timeoutSeconds);
  }

  /** Waits until the opponent is doing something else than `behaviour` (it must have a brain). */
  async waitForBehaviourOtherThan(behaviour: string, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(
      ({opponent}) => opponent?.behaviour !== undefined && opponent.behaviour !== behaviour,
      timeoutSeconds,
    );
  }

  /** Waits until the opponent has fewer than `rounds` in the magazine of the weapon it holds. */
  async waitForRoundsBelow(rounds: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.rounds < rounds);
  }

  /** Waits until the opponent has at least `rounds` in the magazine of the weapon it holds. */
  async waitForRoundsAtLeast(rounds: number, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({opponent}) => opponent !== undefined && opponent.rounds >= rounds, timeoutSeconds);
  }

  /** Waits until the opponent stands at least `tiles` from `spot`. */
  async waitToBeAwayFrom(spot: Point, tiles: number): Promise<void> {
    await this.waitForGameState(
      ({opponent}) => opponent !== undefined && Math.hypot(opponent.x - spot.x, opponent.y - spot.y) >= tiles,
    );
  }
}
