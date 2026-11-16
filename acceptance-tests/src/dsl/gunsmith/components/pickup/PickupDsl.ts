import type {Page} from "@playwright/test";
import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {PickupPlaywright} from "@src/dsl/gunsmith/components/pickup/playwright/PickupPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** The weapon lying in the arena for a fighter to take, reached as `gunsmith.pickup`. */
export class PickupDsl {
  private readonly pickup: PickupPlaywright;

  constructor(page: Page) {
    this.pickup = new PickupPlaywright(page);
  }

  /** Where the weapon lies, whether the player sees it and what it holds; `undefined` when none lies in the arena. */
  async get(): Promise<PickupSnapshot | undefined> {
    try {
      return await this.pickup.get();
    } catch (error) {
      throw new DslError("Failed to read the pickup", error);
    }
  }
}
