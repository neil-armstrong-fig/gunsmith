import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The weapon as it is carried at the start of a fight or a trial: the magazine and the reserve full. */
export function fullCarriedWeapon(weapon: Weapon): CarriedWeapon {
  return {weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve};
}
