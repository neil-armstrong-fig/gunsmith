import type {Page} from "@playwright/test";
import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {PickupPlaywright} from "@src/dsl/gunsmith/components/pickup/playwright/PickupPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {PickupLook} from "@src/dsl/gunsmith/types/PickupLook";

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

  /** What the player sees where the weapon lies, counted by colour: the cage's blue, the core's pale grey and any of the placeholder disc's mint. */
  async getLookOnScreen(): Promise<PickupLook> {
    try {
      return await this.pickup.getLookOnScreen();
    } catch (error) {
      throw new DslError("Failed to read what the pickup looks like on the screen", error);
    }
  }

  /** Waits until a fighter has taken the weapon and none lies in the arena, for as long as `timeoutSeconds` when that is longer than the default. */
  async waitUntilTaken(timeoutSeconds?: number): Promise<void> {
    try {
      await this.pickup.waitUntilTaken(timeoutSeconds);
    } catch (error) {
      throw new DslError("Failed to see a fighter take the weapon lying in the arena", error);
    }
  }
}
