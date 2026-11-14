import type {Page} from "@playwright/test";
import type {VisionSnapshot} from "@gunsmith/shared/state-hook/types/VisionSnapshot";
import {VisionPlaywright} from "@src/dsl/gunsmith/components/vision/playwright/VisionPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** What the player sees in detail, reached as `gunsmith.vision`. */
export class VisionDsl {
  private readonly vision: VisionPlaywright;

  constructor(page: Page) {
    this.vision = new VisionPlaywright(page);
  }

  /** How wide (in degrees) and how far (in tiles) the player's cone reaches with the weapon in hand. */
  async getView(): Promise<VisionSnapshot> {
    try {
      return await this.vision.getView();
    } catch (error) {
      throw new DslError("Failed to read the player's view", error);
    }
  }

  /** Whether the opponent is inside the player's cone with no wall or higher ground in the way, as the game itself reckons it. */
  async isOpponentSeen(): Promise<boolean> {
    try {
      return await this.vision.isOpponentSeen();
    } catch (error) {
      throw new DslError("Failed to read whether the opponent is seen", error);
    }
  }
}
