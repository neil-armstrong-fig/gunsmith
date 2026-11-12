import type {Player} from "@gunsmith/engine/player/types/Player";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";

/** The weapon the player is holding. `switchWeapon` only ever equips a slot the player carries, so one is always there. */
export function equippedWeapon(player: Player): CarriedWeapon {
  const carried = player.loadout[player.equippedIndex];
  if (!carried) {
    throw new Error(`The player has no weapon in slot ${player.equippedIndex + 1}.`);
  }

  return carried;
}
