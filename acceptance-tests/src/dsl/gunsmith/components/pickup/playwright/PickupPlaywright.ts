import type {Page} from "@playwright/test";
import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {lookOfPickup} from "@src/dsl/gunsmith/components/pickup/playwright/look-of-pickup/LookOfPickup";
import {lookOfPickupMarker} from "@src/dsl/gunsmith/components/pickup/playwright/look-of-pickup/marker/LookOfPickupMarker";
import type {PickupMarkerLook} from "@src/dsl/gunsmith/components/pickup/types/PickupMarkerLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {PickupLook} from "@src/dsl/gunsmith/types/PickupLook";

export class PickupPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** The weapon lying in the arena, as the game reports it; `undefined` when none lies there. */
  async get(): Promise<PickupSnapshot | undefined> {
    const {pickup} = await this.readGameState();

    return pickup;
  }

  /** What a player sees where the weapon lies, counted by colour. Throws when none lies in the arena. */
  async getLookOnScreen(): Promise<PickupLook> {
    const pickup = await this.get();
    if (!pickup) {
      throw new Error("No weapon lies in the arena to look at.");
    }

    return await lookOfPickup(this.page, {x: pickup.x, y: pickup.y});
  }

  /** Reads the marker at this place, even after the weapon has been collected. */
  async getMarkerOnScreen(centre: Point): Promise<PickupMarkerLook> {
    return await lookOfPickupMarker(this.page, centre);
  }

  /** Waits until no weapon lies in the arena, for as long as the expect timeout or `timeoutSeconds` allows. A game that never had one counts as taken, so read `get` first. */
  async waitUntilTaken(timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(({pickup}) => pickup === undefined, timeoutSeconds);
  }
}
