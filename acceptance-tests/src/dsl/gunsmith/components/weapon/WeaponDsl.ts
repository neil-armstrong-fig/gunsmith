import type {Page} from "@playwright/test";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";
import {WeaponPlaywright} from "@src/dsl/gunsmith/components/weapon/playwright/WeaponPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The weapon in the player's hands, reached as `gunsmith.weapon`. */
export class WeaponDsl {
  private readonly weapon: WeaponPlaywright;

  constructor(page: Page) {
    this.weapon = new WeaponPlaywright(page);
  }

  /** Which slot the weapon is in (1 or 2), the rounds in its magazine and reserve, and whether it is being reloaded. */
  async get(): Promise<WeaponSnapshot> {
    try {
      return await this.weapon.get();
    } catch (error) {
      throw new DslError("Failed to read the weapon in hand", error);
    }
  }

  /** Waits until the magazine holds exactly `rounds`. */
  async waitForRounds(rounds: number): Promise<void> {
    try {
      await this.weapon.waitForRounds(rounds);
    } catch (error) {
      throw new DslError(`Failed to see ${rounds} rounds in the magazine`, error);
    }
  }

  /** Waits until the weapon in hand is the one in `slot`. */
  async waitForSlot(slot: number): Promise<void> {
    try {
      await this.weapon.waitForSlot(slot);
    } catch (error) {
      throw new DslError(`Failed to see the weapon in slot ${slot} in hand`, error);
    }
  }

  /** Waits until the weapon in hand is being reloaded. */
  async waitForReloadToStart(): Promise<void> {
    try {
      await this.weapon.waitForReloadToStart();
    } catch (error) {
      throw new DslError("Failed to see the reload start", error);
    }
  }

  /** Waits until the weapon in hand is not being reloaded. Call it after `waitForReloadToStart`, or it passes at once. */
  async waitForReloadToEnd(): Promise<void> {
    try {
      await this.weapon.waitForReloadToEnd();
    } catch (error) {
      throw new DslError("Failed to see the reload end", error);
    }
  }
}
