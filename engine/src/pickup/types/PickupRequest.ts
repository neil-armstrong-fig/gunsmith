import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** What a round's pickup is made from: the arena, where each fighter starts, the seed that picks the place and the weapon. */
export interface PickupRequest {
  arena: Arena;
  /** Where each fighter begins; the pickup lies as near as can be to equally far from every one of them by the way they would walk. */
  starts: readonly Point[];
  seed: number;
  weapon: Weapon;
}
