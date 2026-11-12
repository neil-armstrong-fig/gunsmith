import type {Player} from "@gunsmith/engine/player/types/Player";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";

/** The player with `carried` in place of the weapon they are holding; the other weapons are as they were. */
export function withEquippedWeapon(player: Player, carried: CarriedWeapon): Player {
  const loadout = player.loadout.map((held, index) => {
    if (index === player.equippedIndex) {
      return carried;
    }

    return held;
  });

  return {...player, loadout};
}
