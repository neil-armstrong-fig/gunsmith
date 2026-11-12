import type {Page} from "@playwright/test";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

export class WeaponPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async get(): Promise<WeaponSnapshot> {
    const {weapon} = await this.readGameState();

    return weapon;
  }

  async waitForRounds(rounds: number): Promise<void> {
    await this.waitForGameState(({weapon}) => weapon.rounds === rounds);
  }

  async waitForSlot(slot: number): Promise<void> {
    await this.waitForGameState(({weapon}) => weapon.slot === slot);
  }

  async waitForReloadToStart(): Promise<void> {
    await this.waitForGameState(({weapon}) => weapon.reloading);
  }

  async waitForReloadToEnd(): Promise<void> {
    await this.waitForGameState(({weapon}) => !weapon.reloading);
  }
}
