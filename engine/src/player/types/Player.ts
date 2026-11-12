import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";

export interface Player {
  /** The centre of the player's circle. */
  position: Point;
  /** The way the player faces, a vector of length one. */
  aim: Point;
  /** How long until the weapon can fire again; zero when it is ready. One cool-down for both weapons, so a switch cannot dodge it. */
  cooldownSeconds: number;
  /** The weapons the player carries, in slot order: the first is slot 1. */
  loadout: readonly CarriedWeapon[];
  /** Which weapon in `loadout` is in hand (an index, so slot 1 is 0). */
  equippedIndex: number;
  /** How long until the reload of the weapon in hand is done; absent when it is not being reloaded. */
  reloadRemainingSeconds?: number | undefined;
}
