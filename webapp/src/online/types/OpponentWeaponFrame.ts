import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/**
 * The other player's saved weapon in a slot, with its numbers and drawing, which the server sends once when both have locked in that slot (and
 * again after a reconnect before the match begins); the `preRound` frame names it alone. Written out here as `api/` writes it.
 */
export interface OpponentWeaponFrame {
  kind: "opponentWeapon";
  slot: 1 | 2;
  weapon: Weapon;
  appearance: Appearance;
}
